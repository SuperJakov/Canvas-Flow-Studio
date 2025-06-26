import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { internalMutation } from "./functions";
import { TextEditorNodeData } from "./schema";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { api, components, internal } from "./_generated/api";
import type { Tier } from "~/Types/stripe";
import { GoogleGenAI } from "@google/genai";

const DAY = 24 * HOUR;
const MONTH = 30 * DAY;

// Limits will be defined dynamically based on the user's plan.
const rateLimiter = new RateLimiter(components.rateLimiter);

// Helper function to get rate limit configuration based on a user's plan.
// This allows for defining limits dynamically at the point of use.
export const getRateLimitConfigForPlan = (plan: Tier) => {
  switch (plan) {
    case "Pro":
      return { kind: "fixed window" as const, period: MONTH, rate: 100 };
    case "Plus":
      return { kind: "fixed window" as const, period: MONTH, rate: 35 };
    case "Free":
    default:
      return { kind: "fixed window" as const, period: MONTH, rate: 3 };
  }
};

export const getSpeechGenerationRateLimit = query({
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
    const status = await rateLimiter.check(ctx, "speechGeneration", {
      key: identity.subject,
      config, // Pass the dynamic config here
    });

    return status;
  },
});

export const getSpeechUrl = query({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const speechNode = await ctx.db
      .query("speechNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return speechNode?.speechUrl ?? null;
  },
});

const TextEditorExecutionSchema = v.object({
  type: v.literal("textEditor"),
  id: v.string(),
  data: TextEditorNodeData,
});

async function generateSpeech(textContents: string[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const transformMessage = `
  You are an AI which generates text for a speech.
  Your job is to use the following text contents to generate a speech.
  The speech should be engaging.
  You can use onomatopoeia or describe some sounds in paraentheses.
  The speech should be around 100 words long not counting the sounds.

  OUTPUT THE SPEECH WITH SOUNDS. DO NOT ADD ANYTHING ELSE, LIKE INTRODUCTION OR CONCLUSION.

  Here are the text contents:
  ${textContents.join("\n\n")}
  `;
  const transformResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: transformMessage,
  });
  const speech = transformResponse.text;
  if (!speech) {
    throw new Error("Failed to generate speech from text contents.");
  }

  // Generate speech audio using the Gemini API
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: speech }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: "Kore" },
        },
      },
    },
  });

  const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) {
    throw new Error("Failed to generate speech audio data.");
  }
  const audioBuffer = Buffer.from(data, "base64");
  const mimeType =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
  return { audioBuffer, mimeType } as const;
}

export const generateAndStoreSpeech = action({
  args: {
    sourceNodes: v.array(v.union(TextEditorExecutionSchema)),
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
      `User ${identity.subject} requested speech generation. They had ${userPlanInfo.plan} tier and got rate limit of ${config.rate}/${config.period / 1000 / 60 / 60 / 24}day.`,
    );

    // Apply the limit using the dynamic configuration.
    const { ok, retryAfter } = await rateLimiter.limit(
      ctx,
      "speechGeneration",
      {
        key: identity.subject,
        config, // Pass the dynamic config here
      },
    );

    if (!ok) {
      throw new Error(
        `Rate limit reached. Try after: ${Math.ceil(retryAfter / 1000)}s`,
      );
    }

    // Get all text contents from the text nodes, filtering out non-text nodes
    const textContents = sourceNodes
      .filter((node) => node.type === "textEditor" && "data" in node)
      .map((textNode) => textNode.data.text);

    // Generate speech using AI
    const { audioBuffer, mimeType } = await generateSpeech(textContents);

    const speechBlob = new Blob([audioBuffer], { type: mimeType });

    const storageId = await ctx.storage.store(speechBlob);

    await ctx.runMutation(internal.speechNodes.storeResult, {
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
    // Find the node in the speechNodes table by nodeId
    const existing = await ctx.db
      .query("speechNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .unique();

    // Create the speech URL from the storageId
    const speechUrl = await ctx.storage.getUrl(args.storageId);

    if (existing) {
      // Update the existing node with the new speechUrl
      await ctx.db.patch(existing._id, {
        speechUrl,
        storageId: args.storageId,
      });
    } else {
      // Insert a new speech node record if it doesn't exist
      await ctx.db.insert("speechNodes", {
        nodeId: args.nodeId,
        speechUrl,
        storageId: args.storageId,
        whiteboardId: args.whiteboardId,
      });
    }
  },
});
