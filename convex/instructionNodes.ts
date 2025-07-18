import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { api, components } from "./_generated/api";
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
      return { kind: "fixed window" as const, period: MONTH, rate: 500 };
    case "Plus":
      return { kind: "fixed window" as const, period: MONTH, rate: 200 };
    case "Free":
    default:
      return { kind: "fixed window" as const, period: MONTH, rate: 20 };
  }
};

export const getInstructionUseRateLimit = query({
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
    const status = await rateLimiter.check(ctx, "instructionUse", {
      key: identity.subject,
      config, // Pass the dynamic config here
    });

    return status;
  },
});

const acceptedNodeTypes = v.union(
  v.literal("image"),
  v.literal("textEditor"),
  v.literal("speech"),
);

export const detectOutputNodeType = action({
  args: {
    inputNodeTypes: v.array(acceptedNodeTypes),
    instruction: v.string(),
  },
  handler: async (ctx, { inputNodeTypes, instruction }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userPlanInfo = await ctx.runQuery(api.users.getCurrentUserPlanInfo);
    if (!userPlanInfo) throw new Error("Error when getting user's plan");
    const config = getRateLimitConfigForPlan(userPlanInfo.plan);
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "instructionUse", {
      key: identity.subject,
      config,
    });
    if (!ok) {
      throw new Error(
        `Rate limit reached. Try after: ${Math.ceil(retryAfter / 1000)} s`,
      );
    }

    const prompt = `
    Given an instruction and input types, determine the most appropriate output type.
    
    Input types: ${inputNodeTypes.join(", ")}
    Instruction: "${instruction}"
    
    Analyze the instruction and return ONLY one of: TEXTEDITOR, IMAGE, or SPEECH.
    
    IMPORTANT RULES:
    1. If the input is SPEECH and the instruction is about modifying, editing, or enhancing the speech content (even if it's adding examples, facts, or changing the script), output should be SPEECH.
    2. Only output TEXTEDITOR from SPEECH input if the instruction explicitly asks for transcription, writing down, or converting to text format.
    3. Consider the primary intent - is the user trying to create a modified version of the same media type or convert to a different type?
    
    Examples:
    - Inputs: Image Instruction: "Remove the background" -> IMAGE
    - Inputs: Image Instruction: "Describe what you see" -> TEXTEDITOR
    - Inputs: Texteditor Instruction: "Read this aloud with emotion" -> SPEECH
    - Inputs: Image Instruction: "Make it look cyberpunk" -> IMAGE
    - Inputs: Image Instruction "What color is the sky?" -> TEXTEDITOR
    - Inputs: Speech Instruction: "Edit this to make it more passionate" -> SPEECH
    - Inputs: Speech Instruction: "Add more examples to support the argument" -> SPEECH
    - Inputs: Speech Instruction: "Make it sound more professional" -> SPEECH
    - Inputs: Speech Instruction: "Add statistics and facts to the presentation" -> SPEECH
    - Inputs: Speech Instruction: "Transcribe this audio" -> TEXTEDITOR
    - Inputs: Speech Instruction: "Write down what was said" -> TEXTEDITOR
    - Inputs: Speech Instruction: "Convert to text" -> TEXTEDITOR
    

    YOU HAVE TO REPLY WITH EITHER "TEXTEDITOR", "IMAGE" OR "SPEECH".

    Output type:`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }
    const ai = new GoogleGenAI({ apiKey });

    const outputNodeTypeResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: -1, // Model decides thinking
        },
        seed: Math.floor(Math.random() * 10000000),
      },
    });
    const outputNodeType = outputNodeTypeResponse.text?.toLowerCase();
    console.log(outputNodeType);
    if (
      !outputNodeType ||
      !["texteditor", "image", "speech"].includes(outputNodeType)
    ) {
      throw new Error("Output node type is incorrect");
    }
    return outputNodeType as "texteditor" | "image" | "speech";
  },
});
