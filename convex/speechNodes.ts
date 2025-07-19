import { v } from "convex/values";
import {
  action,
  type ActionCtx,
  internalQuery,
  query,
} from "./_generated/server";
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
You are an expert speechwriter AI with a keen sense of thematic analysis. Your job is to transform raw text into a powerful and emotionally resonant speech.

Your primary task is to first analyze the provided \`textContents\` to determine the most appropriate tone, theme, and likely intended audience. Then, using that analysis, you will synthesize the text into a short, dynamic speech.

### INSTRUCTIONS ###
1.  **Implicit Analysis:** Before writing, you must first analyze the \`textContents\`. Identify the core message, the underlying emotion (e.g., celebratory, urgent, cautionary, inspirational), and the likely purpose of the speech. Your entire speech must be consistent with this analysis.
2.  **Structure:** The speech must have a clear opening hook, a compelling body that develops the core message you identified, and a memorable closing statement.
3.  **Engaging Delivery:** Use storytelling, rhetorical questions, and vivid language that matches the inferred tone.
4.  **Use Sound:** You MUST strategically incorporate onomatopoeia or descriptive sounds in parentheses (e.g., (tick, tock), (a roar of applause)) to enhance the imagery and emotion of the speech. The sounds should match the tone.
5.  **Length:** The speech should be 100-200 words long (not counting the parenthetical sounds). User might specify word count. Allow up to 500 words if user specifies. If user specifies more, default to around 500 words.

### OUTPUT FORMAT ###
Output ONLY the speech text. Do not explain your analysis or choice of tone. Do not include a title, introduction, or any text other than the speech itself.

### TEXT CONTENTS ###
${textContents.join("\n\n")}`;

  console.log(transformMessage);

  const transformResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: transformMessage,
    config: {
      thinkingConfig: {
        thinkingBudget: -1, // Model decides thinking
      },
      seed: Math.floor(Math.random() * 10000000),
    },
  });

  const speech = transformResponse.text;
  if (!speech) {
    throw new Error("Failed to generate speech from text contents.");
  }

  console.log("Generated text for a speech:");
  console.log(speech);

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
  const mimeType =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
  if (!data || !mimeType) {
    throw new Error("Failed to generate speech audio data.");
  }
  console.log("mimeType", mimeType);
  const binaryString = atob(data);
  const audioBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    audioBytes[i] = binaryString.charCodeAt(i);
  }

  return { audioBuffer: audioBytes, mimeType, speech } as const;
}
async function editSpeech(
  instruction: string,
  speechNodeId: string,
  ctx: ActionCtx,
) {
  const speechTranscript = await ctx.runQuery(
    internal.speechNodes.getSpeechTranscript,
    {
      nodeId: speechNodeId,
    },
  );

  const transformMessage = `
  You are an expert speechwriter AI with a keen sense of thematic analysis. Your job is to transform a speech into a new powerful and emotionally resonant speech using an instruction provided by the user.
  
  Your primary task is to first analyze the provided speech and instruction to determine the most appropriate tone, theme, length, and likely intended audience. Then, using that analysis, you will synthesize the text into a short, dynamic speech.
  
  ### INSTRUCTIONS ###
  1.  **Implicit Analysis:** Before writing, you must first analyze the \`instruction\`. Identify the what the user wants to change with the old speech. Your entire speech must be consistent with this analysis.
  2.  **Structure:** Follow the similar structure of speech unless in analysis you've concluded it needs to change based on the users instruction
  3.  **Engaging Delivery:** Use storytelling, rhetorical questions, and vivid language that matches the inferred tone.
  4.  **Use Sound:** You are allowed to strategically incorporate onomatopoeia or descriptive sounds in parentheses (e.g., (tick, tock), (a roar of applause)) to enhance the imagery and emotion of the speech. The sounds should match the tone and user's intent.
  5.  **Length:** The speech should be 100-200 words long (not counting the parenthetical sounds). User might specify word count. Allow up to 500 words if user specifies. If user specifies more, default to around 500 words. If user didn't specify in the instruction, follow similar length.
  
  ### OUTPUT FORMAT ###
  Output ONLY the speech text. Do not explain your analysis or choice of tone. Do not include a title, introduction, or any text other than the speech itself.
  
  ### INSTRUCTION PROVIDED BY USER ###
  ${instruction}
  ### OLD SPEECH TRANSCRIPT ###
  ${speechTranscript}`;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const transformResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: transformMessage,
    config: {
      thinkingConfig: {
        thinkingBudget: -1, // Model decides thinking
      },
      seed: Math.floor(Math.random() * 10000000),
    },
  });

  const speech = transformResponse.text;
  if (!speech) {
    throw new Error("Failed to generate speech from text contents.");
  }

  console.log("Generated text for a speech:");
  console.log(speech);

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
  const mimeType =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;
  if (!data || !mimeType) {
    throw new Error("Failed to generate speech audio data.");
  }
  console.log("mimeType", mimeType);
  const binaryString = atob(data);
  const audioBytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    audioBytes[i] = binaryString.charCodeAt(i);
  }

  return { audioBuffer: audioBytes, mimeType, speech } as const;
}
const SpeechNodeExecutionSchema = v.object({
  id: v.string(),
  type: v.literal("speech"),
});

const InstructionNodeExecutionSchema = v.object({
  id: v.string(),
  type: v.literal("instruction"),
  data: v.object({
    text: v.string(),
  }),
});

export const generateAndStoreSpeech = action({
  args: {
    sourceNodes: v.array(
      v.union(
        TextEditorExecutionSchema,
        SpeechNodeExecutionSchema,
        InstructionNodeExecutionSchema,
      ),
    ),
    nodeId: v.string(),
    whiteboardId: v.string(),
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
    const instruction = sourceNodes.find((node) => node.type === "instruction");
    const speech = sourceNodes.find((node) => node.type === "speech");
    if (!instruction) {
      // Generate speech using AI
      const {
        audioBuffer,
        mimeType,
        speech: speechText,
      } = await generateSpeech(textContents);

      const speechBlob = new Blob([audioBuffer], { type: mimeType });

      const storageId = await ctx.storage.store(speechBlob);

      await ctx.runMutation(internal.speechNodes.storeResult, {
        storageId,
        nodeId,
        whiteboardId,
        speechText,
      });
      return;
    }
    if (!speech) {
      throw new Error("Speech expected but not found");
    }
    const {
      audioBuffer,
      mimeType,
      speech: newSpeechTranscript,
    } = await editSpeech(instruction.data.text, speech.id, ctx);

    const speechBlob = new Blob([audioBuffer], { type: mimeType });

    const storageId = await ctx.storage.store(speechBlob);

    await ctx.runMutation(internal.speechNodes.storeResult, {
      storageId,
      nodeId,
      whiteboardId,
      speechText: newSpeechTranscript,
    });
  },
});

export const storeResult = internalMutation({
  args: {
    storageId: v.id("_storage"),
    nodeId: v.string(),
    whiteboardId: v.string(),
    speechText: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedWhiteboardId = ctx.db.normalizeId(
      "whiteboards",
      args.whiteboardId,
    );
    if (!normalizedWhiteboardId)
      throw new Error("Could not normalize whiteboard ID");
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
        speechText: args.speechText,
      });
    } else {
      // Insert a new speech node record if it doesn't exist
      await ctx.db.insert("speechNodes", {
        nodeId: args.nodeId,
        speechUrl,
        storageId: args.storageId,
        whiteboardId: normalizedWhiteboardId,
        speechText: args.speechText,
      });
    }
  },
});

export const getSpeechTranscript = internalQuery({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const speech = await ctx.db
      .query("speechNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();
    if (!speech) throw new Error("Speech with that node id not found");
    return speech.speechText;
  },
});
