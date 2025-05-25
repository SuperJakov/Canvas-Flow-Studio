import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// --- Node schema (adjust this as your design evolves) ---
const TextEditorNodeData = v.object({
  text: v.string(),
  isLocked: v.boolean(),
  isRunning: v.boolean(),
});

const AppNode = v.object({
  id: v.string(),
  type: v.literal("textEditor"),
  data: TextEditorNodeData,
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
});

const AppEdge = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  type: v.optional(v.string()),
  animated: v.optional(v.boolean()),
});

// --- Create a new whiteboard ---
export const createWhiteboard = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, { title }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const now = BigInt(Date.now());
    return await ctx.db.insert("whiteboards", {
      title,
      createdAt: now,
      updatedAt: now,
      ownerId: identity.subject,
      nodes: [],
      edges: [],
    });
  },
});

// --- Edit whiteboard ---
export const editWhiteboard = mutation({
  args: {
    id: v.id("whiteboards"),
    title: v.optional(v.string()),
    nodes: v.optional(v.array(AppNode)),
    edges: v.optional(v.array(AppEdge)), // Fix edges type
  },
  handler: async (ctx, { id, title, nodes, edges }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const whiteboard = await ctx.db.get(id);
    if (!whiteboard) throw new Error("Whiteboard not found");

    if (whiteboard.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
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

    if (whiteboard.ownerId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    return whiteboard;
  },
});
