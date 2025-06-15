import { initialEdges, initialNodes } from "~/app/whiteboard/initial";
import { query } from "./_generated/server";
import { mutation } from "./functions";
import { v } from "convex/values";
import { AppEdge, AppNode } from "./schema";

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

    const now = BigInt(Date.now());
    return await ctx.db.insert("whiteboards", {
      title: `${sourceWhiteboard.title} (Copy)`,
      createdAt: now,
      updatedAt: now,
      ownerId: identity.subject,
      nodes: sourceWhiteboard.nodes,
      edges: sourceWhiteboard.edges,
      isPublic: false,
    });
  },
});
