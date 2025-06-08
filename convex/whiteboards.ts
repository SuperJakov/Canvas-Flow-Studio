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
