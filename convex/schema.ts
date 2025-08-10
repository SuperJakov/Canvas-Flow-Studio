import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { vWorkIdValidator } from "@convex-dev/workpool";

export const TextEditorNodeData = v.object({
  text: v.string(),
  isLocked: v.boolean(),
});

const TextEditorSchema = v.object({
  id: v.string(),
  type: v.literal("textEditor"),
  data: TextEditorNodeData,
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  zIndex: v.optional(v.number()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
});

export const Style = v.union(
  v.literal("auto"),
  v.literal("anime"),
  v.literal("pixel-art"),
  v.literal("cyberpunk"),
  v.literal("3d-model"),
  v.literal("low-poly"),
  v.literal("line-art"),
  v.literal("watercolor"),
  v.literal("pop-art"),
  v.literal("surrealism"),
);

const ImageNodeSchema = v.object({
  id: v.string(),
  type: v.literal("image"),
  data: v.object({
    imageUrl: v.union(v.string(), v.null()),
    isLocked: v.boolean(),
    style: Style,
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  zIndex: v.optional(v.number()),
});

const SpeechNodeSchema = v.object({
  id: v.string(),
  type: v.literal("speech"),
  data: v.object({
    isLocked: v.boolean(),
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  zIndex: v.optional(v.number()),
});

const CommentNodeSchema = v.object({
  id: v.string(),
  type: v.literal("comment"),
  data: v.object({
    isLocked: v.boolean(),
    text: v.string(),
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  zIndex: v.optional(v.number()),
});

const InstructionNodeSchema = v.object({
  id: v.string(),
  type: v.literal("instruction"),
  data: v.object({
    isLocked: v.boolean(),
    text: v.string(),
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  zIndex: v.optional(v.number()),
});

const WebsiteNodeSchema = v.object({
  id: v.string(),
  type: v.literal("website"),
  data: v.object({
    isLocked: v.boolean(),
    srcDoc: v.union(v.string(), v.null()),
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
  }),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  zIndex: v.optional(v.number()),
});

export const AppNode = v.union(
  TextEditorSchema,
  ImageNodeSchema,
  CommentNodeSchema,
  SpeechNodeSchema,
  InstructionNodeSchema,
  WebsiteNodeSchema,
);

export const AppEdge = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  type: v.literal("default"),
  animated: v.optional(v.boolean()),
});

const whiteboards = defineTable({
  title: v.optional(v.string()),
  createdAt: v.int64(),
  updatedAt: v.int64(),
  ownerId: v.string(),
  nodes: v.array(AppNode),
  edges: v.array(AppEdge),
  isPublic: v.boolean(),
  previewUrl: v.optional(v.string()),
  previewStorageId: v.optional(v.id("_storage")),
  projectId: v.optional(v.id("projects")),
})
  .index("by_ownerId", ["ownerId"])
  .index("by_projectId", ["projectId"])
  .index("by_projectId_and_ownerId", ["projectId", "ownerId"]);

const imageNodes = defineTable({
  nodeId: v.string(),
  imageUrl: v.union(v.string(), v.null()),
  storageId: v.union(v.id("_storage"), v.null()),
  whiteboardId: v.id("whiteboards"),
  authorExternalId: v.string(),
  isGenerating: v.optional(v.boolean()),
  imageDescription: v.optional(v.union(v.string(), v.null())),
  poolId: v.optional(v.union(vWorkIdValidator, v.null())),
  isPartialImage: v.optional(v.boolean()),
})
  .index("by_userId", ["authorExternalId"])
  .index("by_nodeId", ["nodeId"])
  .index("by_whiteboardId", ["whiteboardId"])
  .index("by_storageId", ["storageId"])
  .index("by_nodeId_and_whiteboardId", ["nodeId", "whiteboardId"]);

const speechNodes = defineTable({
  nodeId: v.string(),
  speechUrl: v.union(v.string(), v.null()),
  storageId: v.id("_storage"),
  whiteboardId: v.id("whiteboards"),
  speechText: v.string(),
})
  .index("by_nodeId", ["nodeId"])
  .index("by_whiteboardId", ["whiteboardId"])
  .index("by_storageId", ["storageId"])
  .index("by_nodeId_and_whiteboardId", ["nodeId", "whiteboardId"]);

const websiteNodes = defineTable({
  nodeId: v.string(),
  whiteboardId: v.id("whiteboards"),
  authorExternalId: v.string(),
  isGenerating: v.optional(v.boolean()),
  srcDoc: v.union(v.string(), v.null()),
})
  .index("by_userId", ["authorExternalId"])
  .index("by_nodeId", ["nodeId"])
  .index("by_whiteboardId", ["whiteboardId"])
  .index("by_nodeId_and_whiteboardId", ["nodeId", "whiteboardId"]);

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

const subscriptions = defineTable({
  userExternalId: v.string(),
  subscriptionId: v.string(),
  status: v.union(
    v.literal("incomplete"),
    v.literal("incomplete_expired"),
    v.literal("trialing"),
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled"),
    v.literal("unpaid"),
  ),
  cancel_at_period_end: v.boolean(),
  current_period_start: v.int64(),
  current_period_end: v.union(v.int64(), v.null()),
  canceled_at: v.int64(),
  price_id: v.string(),
  last_status_sync_at: v.int64(),
})
  .index("by_userExternalId", ["userExternalId"])
  .index("by_subscriptionId", ["subscriptionId"]);

export const imageLogFields = {
  userExternalId: v.string(),
  whiteboardId: v.id("whiteboards"),
  nodeId: v.string(),
  action: v.union(v.literal("generate"), v.literal("edit")),
  timestamp: v.int64(),
  model: v.literal("gpt-image-1"),
  prompt: v.optional(v.string()),
  quality: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  resolution: v.union(
    v.literal("1024x1024"),
    v.literal("1024x1536"),
    v.literal("1536x1024"),
  ),
  inputTokenDetails: v.optional(
    v.object({
      imageTokens: v.optional(v.number()),
      textTokens: v.optional(v.number()),
    }),
  ),
};

const imageLogs = defineTable(imageLogFields)
  .index("by_userId", ["userExternalId"])
  .index("by_whiteboard", ["whiteboardId"])
  .index("by_node", ["nodeId"]);

const projects = defineTable({
  userExternalId: v.string(),
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  parentProject: v.optional(v.id("projects")),
})
  .index("by_userId", ["userExternalId"])
  .index("by_user_and_parent", ["userExternalId", "parentProject"]);

export const CreditType = v.union(
  v.literal("image"),
  v.literal("speech"),
  v.literal("website"),
);

const transactions = defineTable({
  amount: v.number(), // Positive for additions, negative for usage/deductions
  type: v.union(
    // Credit additions
    v.literal("trial"),
    v.literal("subscription"),
    v.literal("topup"),
    // Usage
    v.literal("usage"),
    // Adjustments
    v.literal("adjustment"),
    v.literal("refund"),
    // Signup
    v.literal("signup"),
  ),

  userId: v.string(),
  // System fields
  reason: v.optional(v.string()), // Human readable reason for the credit transaction
  metadata: v.optional(v.record(v.string(), v.any())), // Additional data
  idempotencyKey: v.optional(v.string()), // For preventing duplicate transactions
  updatedAt: v.number(), // ISO string - last update time
  creditType: CreditType,
});

const schema = defineSchema({
  users,
  subscriptions,
  whiteboards,
  imageNodes,
  speechNodes,
  websiteNodes,
  imageLogs,
  projects,
  transactions,
});

export default schema;
