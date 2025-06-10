import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const TextEditorNodeData = v.object({
  text: v.string(),
  isLocked: v.boolean(),
  isRunning: v.boolean(),
});

const TextEditorSchema = v.object({
  id: v.string(),
  type: v.literal("textEditor"),
  data: TextEditorNodeData,
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
});

const ImageNodeSchema = v.object({
  id: v.string(),
  type: v.literal("image"),
  data: v.object({
    imageUrl: v.union(v.string(), v.null()),
    isLocked: v.boolean(),
    isRunning: v.boolean(),
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
});

export const UndefinedTypeNode = v.object({
  // ! Used for typesafety when sending
  id: v.string(),
  type: v.optional(v.string()),
});

export const AppNode = v.union(
  TextEditorSchema,
  ImageNodeSchema,
  UndefinedTypeNode,
);

export const AppEdge = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  type: v.optional(v.string()),
  animated: v.optional(v.boolean()),
});

const whiteboards = defineTable({
  title: v.optional(v.string()),
  createdAt: v.int64(),
  updatedAt: v.int64(),
  ownerId: v.string(),
  nodes: v.array(AppNode),
  edges: v.array(AppEdge),
}).index("by_ownerId", ["ownerId"]);

const imageNodes = defineTable({
  nodeId: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  storageId: v.id("_storage"),
  whiteboardId: v.id("whiteboards"),
})
  .index("by_nodeId", ["nodeId"])
  .index("by_whiteboardId", ["whiteboardId"]);

const users = defineTable({
  firstName: v.union(v.null(), v.string()),
  lastName: v.union(v.null(), v.string()),
  externalId: v.string(), // This is the Clerk user ID (subject)

  // Stripe-related fields
  stripeCustomerId: v.optional(v.string()),
  plan: v.optional(
    v.union(v.literal("Free"), v.literal("Plus"), v.literal("Pro")),
  ),
})
  .index("byExternalId", ["externalId"])
  // Index for finding users via Stripe customer ID (useful for webhooks)
  .index("by_stripeCustomerId", ["stripeCustomerId"]);

const schema = defineSchema({
  users,
  whiteboards,
  imageNodes,
});

export default schema;
