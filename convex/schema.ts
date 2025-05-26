import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const TextEditorNodeData = v.object({
  text: v.string(),
  isLocked: v.boolean(),
  isRunning: v.boolean(),
});

const AppNode = v.object({
  id: v.string(),
  type: v.optional(v.literal("textEditor")), // Optional for undefined values
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

const whiteboards = defineTable({
  title: v.optional(v.string()),
  createdAt: v.int64(),
  updatedAt: v.int64(),
  ownerId: v.string(),
  nodes: v.array(AppNode),
  edges: v.array(AppEdge),
}).index("by_ownerId", ["ownerId"]);

const schema = defineSchema({
  ...authTables,
  whiteboards,
});

export default schema;
