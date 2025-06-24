import { initialEdges, initialNodes } from "~/app/whiteboard/initial";
import { query } from "./_generated/server";
import { internalMutation, mutation } from "./functions";
import { v } from "convex/values";
import { AppEdge, AppNode } from "./schema";
import { v4 as uuidv4 } from "uuid";
import { internal } from "./_generated/api";

// --- Create a new whiteboard ---
export const createWhiteboard = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, { title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    if (title && title.length > 30) {
      throw new Error("Title must be at most 30 characters long");
    }

    const now = BigInt(Date.now());
    return await ctx.db.insert("whiteboards", {
      title: title.trim() === "" ? "Untitled Whiteboard" : title,
      createdAt: now,
      updatedAt: now,
      ownerId: identity.subject,
      nodes: initialNodes,
      edges: initialEdges,
      isPublic: false,
    });
  },
});

// --- Edit whiteboard ---
export const editWhiteboard = mutation({
  args: {
    id: v.id("whiteboards"),
    title: v.optional(v.string()),
    nodes: v.optional(v.array(AppNode)),
    edges: v.optional(v.array(AppEdge)),
  },
  handler: async (ctx, { id, title, nodes, edges }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const whiteboard = await ctx.db.get(id);
    if (!whiteboard) throw new Error("Whiteboard not found");

    if (whiteboard.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (title && title.length > 30) {
      throw new Error("Title must be at most 30 characters long");
    }

    if (nodes) {
      for (const node of nodes) {
        if (node.type === "textEditor" || node.type === "comment") {
          if (node.data.text.length > 10000) {
            throw new Error(
              "Text content exceeds maximum length of 10000 characters",
            );
          }
        }
      }
    }

    await ctx.db.patch(id, {
      title: title ?? whiteboard.title ?? undefined,
      nodes: nodes ?? whiteboard.nodes,
      edges: edges ?? whiteboard.edges,
      updatedAt: BigInt(Date.now()),
    });
  },
});

// --- Delete whiteboard ---
export const deleteWhiteboard = mutation({
  args: { id: v.id("whiteboards") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const whiteboard = await ctx.db.get(id);
    if (!whiteboard) throw new Error("Whiteboard not found");

    if (whiteboard.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(id);
  },
});

// --- List all whiteboards for the current user ---
export const listWhiteboards = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("whiteboards")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", identity.subject))
      .collect();
  },
});

// --- Get a specific whiteboard by ID ---
export const getWhiteboard = query({
  args: { id: v.id("whiteboards") },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const normalizedId = ctx.db.normalizeId("whiteboards", id);
    if (!normalizedId) {
      return undefined; // Return undefined if the ID is invalid
    }

    const whiteboard = await ctx.db.get(normalizedId);
    if (!whiteboard) return undefined;

    if (whiteboard.isPublic) {
      return whiteboard;
    }

    if (whiteboard.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return whiteboard;
  },
});

// --- Set the public status of a whiteboard ---
export const setPublicStatus = mutation({
  args: {
    id: v.id("whiteboards"),
    isPublic: v.boolean(),
  },
  handler: async (ctx, { id, isPublic }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const whiteboard = await ctx.db.get(id);
    if (!whiteboard) throw new Error("Whiteboard not found");

    // Only the owner can change the public status.
    if (whiteboard.ownerId !== identity.subject) {
      throw new Error("Unauthorized: Only the owner can change this setting.");
    }

    await ctx.db.patch(id, {
      isPublic,
      updatedAt: BigInt(Date.now()),
    });
  },
});

// --- Copy a public whiteboard ---
export const copyPublicWhiteboard = mutation({
  args: {
    sourceId: v.id("whiteboards"),
  },
  handler: async (ctx, { sourceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const sourceWhiteboard = await ctx.db.get(sourceId);
    if (!sourceWhiteboard) throw new Error("Source whiteboard not found");

    if (!sourceWhiteboard.isPublic) {
      throw new Error("Can only copy public whiteboards");
    }

    // --- Step 1: Prepare new node data and gather image mappings ---

    const newNodes = [];
    const imageNodeMappings = []; // To store { newId, storageId }
    const nodeIdMap = new Map<string, string>(); // Map old node IDs to new node IDs

    for (const node of sourceWhiteboard.nodes) {
      const newId = uuidv4(); // Generate a new, unique ID for the copied node
      nodeIdMap.set(node.id, newId); // Store the mapping

      if (node.type === "image") {
        // This is an image node, we need to find its storageId
        const originalImageRecord = await ctx.db
          .query("imageNodes")
          .withIndex("by_nodeId_and_whiteboardId", (q) =>
            q.eq("nodeId", node.id).eq("whiteboardId", sourceId),
          )
          .first();

        if (originalImageRecord) {
          // If we found the record, save the mapping. We will use this
          // to create a new imageNodes record for our new whiteboard.
          imageNodeMappings.push({
            newId: newId,
            storageId: originalImageRecord.storageId,
            imageUrl: originalImageRecord.imageUrl, // Keep the URL consistent
          });
        } else {
          // This indicates a data integrity problem, the image might already be broken.
          // We'll skip copying the link to prevent errors.
          console.warn(`Could not find image record for nodeId: ${node.id}`);
          // We still push the node, but its imageUrl will be whatever was in the source.
          // It might appear broken, which is accurate.
        }
      }

      // Add the copied node with its new ID to our array.
      newNodes.push({ ...node, id: newId });
    }

    // --- Step 2: Remap edges to use new node IDs ---
    const newEdges = sourceWhiteboard.edges.map((edge) => ({
      ...edge,
      id: uuidv4(), // Generate new ID for the edge
      source: nodeIdMap.get(edge.source) ?? edge.source, // Map source to new ID
      target: nodeIdMap.get(edge.target) ?? edge.target, // Map target to new ID
    }));

    // --- Step 3: Insert the new whiteboard to get its ID ---

    const now = BigInt(Date.now());
    const newWhiteboardId = await ctx.db.insert("whiteboards", {
      title: `${sourceWhiteboard.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      ownerId: identity.subject,
      nodes: newNodes,
      edges: newEdges,
      isPublic: false,
    });

    // --- Step 4: Create the new imageNodes records ---

    for (const mapping of imageNodeMappings) {
      await ctx.db.insert("imageNodes", {
        nodeId: mapping.newId,
        storageId: mapping.storageId,
        imageUrl: mapping.imageUrl,
        whiteboardId: newWhiteboardId, // Link to the NEW whiteboard
      });
    }

    // Return the ID of the newly created whiteboard
    return newWhiteboardId;
  },
});

export const generatePreviewUploadUrl = mutation({
  args: {
    whiteboardId: v.id("whiteboards"),
  },
  handler: async (ctx, { whiteboardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const whiteboard = await ctx.db
      .query("whiteboards")
      .withIndex("by_id", (q) => q.eq("_id", whiteboardId))
      .first();
    if (!whiteboard) {
      throw new Error("Whiteboard not found");
    }
    if (whiteboard.ownerId !== identity.subject) {
      throw new Error(
        "Unauthorized: Only the owner can generate a preview upload URL.",
      );
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadPreviewImage = mutation({
  args: {
    whiteboardId: v.id("whiteboards"),
    previewImageStorageId: v.id("_storage"),
  },
  handler: async (ctx, { whiteboardId, previewImageStorageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const whiteboard = await ctx.db
      .query("whiteboards")
      .withIndex("by_id", (q) => q.eq("_id", whiteboardId))
      .first();
    if (!whiteboard) {
      throw new Error("Whiteboard not found");
    }
    if (whiteboard.ownerId !== identity.subject) {
      throw new Error(
        "Unauthorized: Only the owner can upload a preview image.",
      );
    }

    const previewImageUrl = await ctx.storage.getUrl(previewImageStorageId);
    if (!previewImageUrl) {
      throw new Error("Failed to retrieve the preview image URL.");
    }

    const oldPreviewStorageId = whiteboard.previewStorageId;
    if (oldPreviewStorageId) {
      await ctx.scheduler.runAfter(0, internal.whiteboards.deletePreviewImage, {
        storageId: oldPreviewStorageId,
      });
    }

    // Update the whiteboard with the new preview image storage ID
    await ctx.db.patch(whiteboardId, {
      previewStorageId: previewImageStorageId,
      updatedAt: BigInt(Date.now()),
      previewUrl: previewImageUrl,
    });

    return { success: true };
  },
});

export const deletePreviewImage = internalMutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Delete the storage object
    await ctx.storage.delete(storageId);
  },
});
