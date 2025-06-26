import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
  internalQuery,
} from "./_generated/server";
import type { DataModel, Id } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { GenericMutationCtx } from "convex/server";

const BATCH_SIZE = 100;

const triggers = new Triggers<DataModel>();

// These are the definitions that make the custom mutations work with triggers
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
);

export const hasOtherReferences = internalQuery({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const refs = await ctx.db
      .query("imageNodes")
      .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
      .take(1); // We only need to know if at least one exists
    return refs.length > 0;
  },
});

// Helper function to handle potential file deletion
async function handleOrphanedStorage(
  ctx: GenericMutationCtx<DataModel>,
  storageId: Id<"_storage"> | null | undefined,
) {
  if (!storageId) {
    return;
  }

  // Check if any *other* imageNodes still reference this storageId.
  // The trigger runs *after* the delete/update, so if the query
  // returns 0 results, we know the one we just processed was the last one.
  const hasRefs = await ctx.runQuery(internal.functions.hasOtherReferences, {
    storageId,
  });

  if (!hasRefs) {
    // No more references exist, so it's safe to delete the file.
    console.log(
      `Last reference to storageId ${storageId} removed. Deleting file.`,
    );
    await ctx.storage.delete(storageId);
  } else {
    console.log(
      `StorageId ${storageId} is still in use by other nodes. Not deleting.`,
    );
  }
}

triggers.register("imageNodes", async (ctx, change) => {
  // Logic for when an image is REPLACED in a node
  if (change.operation === "update") {
    const oldStorageId = change.oldDoc?.storageId;
    const newStorageId = change.newDoc.storageId;
    // Only proceed if the storageId actually changed and there was an old one
    if (oldStorageId && oldStorageId !== newStorageId) {
      // The old storageId might be orphaned now, so we check it.
      await handleOrphanedStorage(ctx, oldStorageId);
    }
  }

  // Logic for when an image node is DELETED
  if (change.operation === "delete") {
    const oldStorageId = change.oldDoc?.storageId;
    // The storageId is now potentially orphaned, so we check it.
    await handleOrphanedStorage(ctx, oldStorageId);
  }
});

// Use the custom internalMutation so triggers can be fired from its db operations
export const deleteImageNodesByWhiteboard = internalMutation({
  args: { whiteboardId: v.id("whiteboards") },
  handler: async (ctx, { whiteboardId }) => {
    // Fetch a batch of image nodes
    const imageNodes = await ctx.db
      .query("imageNodes")
      .withIndex("by_whiteboardId", (q) => q.eq("whiteboardId", whiteboardId))
      .take(BATCH_SIZE);
    console.log("BATCH: Deleting image nodes... Found:", imageNodes.length);
    // Delete DB records for each image node
    // This ctx.db.delete will now go through triggers.wrapDB
    for (const node of imageNodes) {
      await ctx.db.delete(node._id);
    }

    // If there are more image nodes, reschedule
    if (imageNodes.length === BATCH_SIZE) {
      await ctx.scheduler.runAfter(
        0,
        internal.functions.deleteImageNodesByWhiteboard,
        {
          whiteboardId,
        },
      );
    }
  },
});

export const deletePreviewImageForWhiteboard = internalMutation({
  args: { whiteboardId: v.id("whiteboards") },
  handler: async (ctx, { whiteboardId }) => {
    const whiteboard = await ctx.db
      .query("whiteboards")
      .withIndex("by_id", (q) => q.eq("_id", whiteboardId))
      .first();
    if (!whiteboard) {
      console.warn("Whiteboard not found for ID:", whiteboardId);
      return;
    }

    const storageId = whiteboard.previewStorageId;
    if (!storageId) {
      console.warn(
        "No preview image storage ID found for whiteboard ID:",
        whiteboardId,
      );
      return;
    }

    // Delete the preview image file
    await ctx.storage.delete(storageId);
    console.log(
      "Deleted preview image for whiteboard ID:",
      whiteboardId,
      "Storage ID:",
      storageId,
    );
  },
});

triggers.register("whiteboards", async (ctx, change) => {
  if (change.operation === "delete") {
    console.log(
      "Whiteboard was deleted! Deleting image nodes! ID:",
      change.oldDoc._id,
    );
    // Schedule deletion of all image nodes associated with this whiteboard
    await ctx.scheduler.runAfter(
      0,
      internal.functions.deleteImageNodesByWhiteboard,
      {
        whiteboardId: change.oldDoc._id,
      },
    );
    await ctx.scheduler.runAfter(
      0,
      internal.functions.deletePreviewImageForWhiteboard,
      {
        whiteboardId: change.oldDoc._id,
      },
    );
  }
});

// Use the custom internalMutation so triggers can be fired from its db operations
export const deleteWhiteboardsByOwner = internalMutation({
  args: { ownerId: v.string() },
  handler: async (ctx, { ownerId }) => {
    console.log("Deleting all whiteboards for user with ID:", ownerId);
    // Fetch a batch of whiteboards
    const whiteboards = await ctx.db
      .query("whiteboards")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", ownerId))
      .take(BATCH_SIZE); // Batch size

    // Delete the batch
    // This ctx.db.delete will now go through triggers.wrapDB
    for (const whiteboard of whiteboards) {
      await ctx.db.delete(whiteboard._id);
    }

    // If there are more whiteboards, reschedule
    if (whiteboards.length === BATCH_SIZE) {
      await ctx.scheduler.runAfter(
        0,
        internal.functions.deleteWhiteboardsByOwner,
        {
          ownerId,
        },
      );
    }
  },
});

triggers.register("users", async (ctx, change) => {
  if (change.operation === "delete") {
    console.log(
      "User deletion triggered! Deleting all whiteboards ID:",
      change.oldDoc.externalId, // Assuming externalId exists on the user doc
    );
    // Schedule a function to delete all whiteboards for this user
    await ctx.scheduler.runAfter(
      0,
      internal.functions.deleteWhiteboardsByOwner,
      {
        // Make sure ownerId on whiteboards matches the user's externalId
        ownerId: change.oldDoc.externalId,
      },
    );
  }
});
