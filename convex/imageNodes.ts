import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internalMutation } from "./functions";
import { TextEditorNodeData } from "./schema";
import OpenAI from "openai";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { api, components, internal } from "./_generated/api";
import type { UserIdentity } from "convex/server";
import type { Tier } from "~/Types/stripe";

const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

// Limits will be defined dynamically based on the user's plan.
const rateLimiter = new RateLimiter(components.rateLimiter);

// Helper function to get rate limit configuration based on a user's plan.
// This allows for defining limits dynamically at the point of use.
export const getRateLimitConfigForPlan = (plan: Tier) => {
  switch (plan) {
    case "Pro":
      return { kind: "fixed window" as const, period: MONTH, rate: 250 };
    case "Plus":
      return { kind: "fixed window" as const, period: MONTH, rate: 100 };
    case "Free":
    default:
      return { kind: "fixed window" as const, period: MONTH, rate: 10 };
  }
};

export const getImageGenerationRateLimit = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get the user's current plan to check the correct rate limit.
    const userPlanInfo = await ctx.runQuery(api.users.getCurrentUserPlanInfo);
    if (!userPlanInfo) {
      throw new Error("Could not retrieve user plan info.");
    }

    // Get the dynamic rate limit configuration for the user's plan.
    const config = getRateLimitConfigForPlan(userPlanInfo.plan);

    // Check the rate limit status using the dynamic configuration.
    const status = await rateLimiter.check(ctx, "imageGeneration", {
      key: identity.subject,
      config, // Pass the dynamic config here
    });

    return status;
  },
});

export const getImageNodeUrl = query({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return imageNode?.imageUrl ?? null;
  },
});

const TextEditorExecutionSchema = v.object({
  type: v.literal("textEditor"),
  id: v.string(),
  data: TextEditorNodeData,
});

const ImageNodeExecutionSchema = v.object({
  id: v.string(),
  type: v.literal("image"),
  data: v.object({
    isLocked: v.boolean(),
    isRunning: v.boolean(),
    imageUrl: v.union(v.null(), v.string()), // ! This is not traditional image node data, this should be added before sending
  }),
});

async function generateAIImage(identity: UserIdentity, textContents: string[]) {
  // Check if PREVIEW_IMAGE_URL is present in environment variables
  const previewImageUrl = process.env.PREVIEW_IMAGE_URL;
  if (previewImageUrl) {
    return previewImageUrl;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Add your OPENAI_API_KEY as an env variable in the " +
        "[dashboard](https://dasboard.convex.dev)",
    );
  }

  const openai = new OpenAI({ apiKey });
  const prompt = `Create a visually engaging image that includes the following elements:
  ${textContents.map((text) => `- ${text}`).join("\n")}
  Ensure the elements are clearly represented and cohesively integrated into the scene. Use a consistent visual style that enhances clarity and appeal.`;

  const openAiResponse = await openai.images.generate({
    prompt,
    model: "gpt-image-1",
    quality: "low",
    n: 1,
    size: "1024x1024",
    user: identity.subject,
    moderation: "low",
  });

  if (!openAiResponse.data) {
    throw new Error("No data received from OpenAI image generation response");
  }
  const generatedImageUrl = openAiResponse.data[0]?.url;
  if (!generatedImageUrl) {
    throw new Error("Failed to generate image URL from OpenAI");
  }

  return generatedImageUrl;
}

export const generateAndStoreImage = action({
  args: {
    sourceNodes: v.array(
      v.union(TextEditorExecutionSchema, ImageNodeExecutionSchema),
    ),
    nodeId: v.string(),
    whiteboardId: v.id("whiteboards"),
  },
  handler: async (ctx, { sourceNodes, nodeId, whiteboardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userPlanInfo = await ctx.runQuery(api.users.getCurrentUserPlanInfo);
    if (!userPlanInfo) {
      throw new Error("Error when getting user's plan: User not logged in??");
    }

    // Get the dynamic rate limit configuration for the user's plan.
    const config = getRateLimitConfigForPlan(userPlanInfo.plan);

    console.log(
      `User ${identity.subject} requested image generation. They had ${userPlanInfo.plan} tier and got rate limit of ${config.rate}/${config.period / 1000 / 60 / 60 / 24}day.`,
    );

    // Apply the limit using the dynamic configuration.
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "imageGeneration", {
      key: identity.subject,
      config, // Pass the dynamic config here
    });

    if (!ok) {
      throw new Error(
        `Rate limit reached. Try after: ${Math.ceil(retryAfter / 1000)}s`,
      );
    }
    // Get all text contents from the text nodes, filtering out non-text nodes
    const textContents = sourceNodes
      .filter((node) => node.type === "textEditor" && "data" in node)
      .map((textNode) => textNode.data.text);

    // Generate image using AI
    const imageUrl = await generateAIImage(identity, textContents);

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`failed to download: ${imageResponse.statusText}`);
    }

    // Store the image to Convex storage
    const image = await imageResponse.blob();
    const storageId = await ctx.storage.store(image);

    await ctx.runMutation(internal.imageNodes.storeResult, {
      storageId,
      nodeId,
      whiteboardId,
    });
  },
});

export const storeResult = internalMutation({
  args: {
    storageId: v.id("_storage"),
    nodeId: v.string(),
    whiteboardId: v.id("whiteboards"),
  },
  handler: async (ctx, args) => {
    // Find the node in the imageNodes table by nodeId
    const existing = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .unique();

    // Create the image URL from the storageId
    const imageUrl = await ctx.storage.getUrl(args.storageId);

    if (existing) {
      // Update the existing node with the new imageUrl
      await ctx.db.patch(existing._id, { imageUrl, storageId: args.storageId });
    } else {
      // Insert a new image node record if it doesn't exist
      await ctx.db.insert("imageNodes", {
        nodeId: args.nodeId,
        imageUrl,
        storageId: args.storageId,
        whiteboardId: args.whiteboardId,
      });
    }
  },
});

export const uploadAndStoreImage = action({
  args: {
    file: v.bytes(),
    nodeId: v.string(),
    whiteboardId: v.id("whiteboards"),
  },
  handler: async (ctx, { file, nodeId, whiteboardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Store the uploaded file to Convex storage
    const storageId = await ctx.storage.store(new Blob([file]));

    // Call storeResult to update or insert the image node record
    await ctx.runMutation(internal.imageNodes.storeResult, {
      storageId,
      nodeId,
      whiteboardId,
    });
  },
});
