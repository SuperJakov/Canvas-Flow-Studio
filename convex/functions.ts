import {
  mutation as rawMutation,
  internalMutation as rawInternalMutation,
} from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";
import { Triggers } from "convex-helpers/server/triggers";
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const BATCH_SIZE = 100;

const triggers = new Triggers<DataModel>();

// These are the definitions that make the custom mutations work with triggers
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(
  rawInternalMutation,
  customCtx(triggers.wrapDB),
);

triggers.register("imageNodes", async (ctx, change) => {
  if (change.operation === "update") {
    if (
      change.oldDoc?.storageId &&
      // ! Don't delete if changes dont affect storage
      change.newDoc.storageId !== change.oldDoc.storageId
    ) {
      console.log(
        "Image node updated! Deleting image with storageId:",
        change.oldDoc.storageId,
      );
      await ctx.storage.delete(change.oldDoc.storageId);
    }
  }
  if (change.operation === "delete") {
    if (change.oldDoc?.storageId) {
      console.log(
        "Image node deleted! Deleting image with storageId forever:",
        change.oldDoc.storageId,
      );
      await ctx.storage.delete(change.oldDoc.storageId);
    }
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
