import { v } from "convex/values";
import { action } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";

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
    // TODO: Rate limit

    const prompt = `
    Given an instruction and input types, determine the most appropriate output type.
    
    Input types: ${inputNodeTypes.join(", ")}
    Instruction: "${instruction}"
    
    Analyze the instruction and return ONLY one of: TEXTEDITOR, IMAGE, or SPEECH
    
    Examples:
    - "Remove the background" -> IMAGE
    - "Describe what you see" -> TEXTEDITOR
    - "Read this aloud with emotion" -> SPEECH
    - "Make it look cyberpunk" -> IMAGE
    - "What color is the sky?" -> TEXTEDITOR
    - "Generate a voiceover" -> SPEECH
    

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
      },
    });
    const outputNodeType = outputNodeTypeResponse.text?.toLowerCase();
    if (
      !outputNodeType ||
      !["texteditor", "image", "speech"].includes(outputNodeType)
    ) {
      throw new Error("Output node type is incorrect");
    }
    return outputNodeType as "texteditor" | "image" | "speech";
  },
});
