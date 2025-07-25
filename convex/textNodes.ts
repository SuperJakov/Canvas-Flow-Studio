import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";
import { internalMutation } from "./functions";
import { internal } from "./_generated/api";

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

export const describeImages = action({
  args: {
    imageNodeIds: v.array(v.string()),
  },
  handler: async (ctx, { imageNodeIds }) => {
    const imageNodes = await ctx.runMutation(internal.textNodes.getImageNodes, {
      imageNodeIds,
    });

    const images = [];
    for (const imageNode of imageNodes) {
      if (!imageNode?.imageUrl) continue;

      const blob = await fetch(imageNode.imageUrl).then((res) => res.blob());
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 10000;

      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }

      const base64 = btoa(binary);

      images.push({ data: base64, mimeType: blob.type });
    }

    const ai = initGemini();

    const result = await ai.models.generateContent({
      contents: [
        ...images.map((image) => ({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        })),
        {
          text: "Describe key elements and content from these images in 1-2 sentences maximum. Focus on main subjects and important details using direct language. Avoid phrases like 'the image shows' or 'I can see'. Keep responses under 50 words. If you can't see the images, say 'No images'",
        },
      ],
      model: "gemini-2.5-flash",
      config: {
        thinkingConfig: {
          thinkingBudget: -1,
        },
        seed: Math.floor(Math.random() * 10000000),
      },
    });

    return result.text;
  },
});

export const getImageNodes = internalMutation({
  args: {
    imageNodeIds: v.array(v.string()),
  },
  handler: async (ctx, { imageNodeIds }) => {
    const results = [];

    for (const nodeId of imageNodeIds) {
      const imageNode = await ctx.db
        .query("imageNodes")
        .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
        .first();

      if (imageNode) results.push(imageNode);
    }

    return results;
  },
});
