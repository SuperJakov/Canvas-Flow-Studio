import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }
  const ai = new GoogleGenAI({ apiKey });

  return ai;
}

export const modifyText = action({
  args: {
    text: v.string(),
    instruction: v.string(),
  },
  handler: async (ctx, args) => {
    const ai = initGemini();

    const prompt = `Modify the following text: "${args.text}" based on the instruction: "${args.instruction}". Respond with only the modified text, without any introductory phrases like "Here's the modified text:". YOU HAVE TO TRY.`;

    const result = await ai.models.generateContent({
      contents: prompt,
      model: "gemini-2.5-flash",
      config: {
        thinkingConfig: {
          thinkingBudget: -1, // Model decides thinking
        },
        seed: Math.floor(Math.random() * 10000000),
      },
    });
    if (!result.text) throw new Error("Failed to modify text");

    return result.text;
  },
});
