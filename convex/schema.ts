import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
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
}).index("by_nodeId", ["nodeId"]);

const schema = defineSchema({
  ...authTables,
  whiteboards,
  imageNodes,
});

export default schema;
