import { type Infer, v } from "convex/values";
import {
  action,
  internalAction,
  internalQuery,
  query,
} from "./_generated/server";
import { internalMutation } from "./functions";
import { Style, TextEditorNodeData } from "./schema";
import { AzureOpenAI } from "openai";
import { api, components, internal } from "./_generated/api";
import type { UserIdentity } from "convex/server";
import { Workpool } from "@convex-dev/workpool";
import { GoogleGenAI } from "@google/genai";
import { type Doc } from "./_generated/dataModel";

function initGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }
  const ai = new GoogleGenAI({ apiKey });

  return ai;
}

const imageDescriptionPool = new Workpool(components.imageDescription, {
  maxParallelism: 1,
  retryActionsByDefault: true,
});

export const getImageGenerationRateLimit = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const remainingImageCredits = await ctx.runQuery(
      internal.credits.getRemainingCredits,
      {
        userId: identity.subject,
        creditType: "image",
      },
    );
    console.log("Remaining image credits", remainingImageCredits);
    if (remainingImageCredits < 1) {
      return {
        isRateLimited: true,
      };
    }
    return { isRateLimited: false };
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

export const getImageNodeUrlInternal = internalQuery({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return imageNode?.imageUrl ?? null;
  },
});

export const getImageNodeByNodeId = internalQuery({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return imageNode;
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
    internal: v.object({ isRunning: v.boolean() }),
    imageUrl: v.union(v.null(), v.string()), // ! This is not traditional image node data, this should be added before sending
  }),
});
function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary); // browser / Convex runtime API
}

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to fetch source image: ${res.statusText}`);
  const arrayBuf = await res.arrayBuffer();
  return arrayBufferToBase64(arrayBuf);
}

export type StyleType = Infer<typeof Style>;

const systemPrompts: Record<StyleType, string> = {
  auto: "",
  anime:
    "anime aesthetic with expressive eyes, smooth colors with shaded effects, and clean lines",
  "pixel-art":
    "pixel art style using a limited color palette and visible, crisp square pixels with a retro 8-bit or 16-bit video game aesthetic",
  cyberpunk:
    "cyberpunk style with glowing neon lights, towering architecture, and rain-slicked streets in a high-tech, gritty atmosphere",
  "3d-model":
    "3D rendered style with clean geometry, smooth surfaces, and dynamic lighting with realistic shadows",
  "low-poly":
    "low poly art style with visible flat-shaded polygons in a clean, geometric aesthetic",
  "line-art":
    "minimalist line art using only clean black lines on a white background with no color or shading",
  watercolor:
    "watercolor painting style with soft, translucent layers of color that bleed together",
  "pop-art":
    "Pop Art style with bold, vibrant colors and thick graphic outlines inspired by 1960s comic books",
  surrealism:
    "surrealist style depicting dream-like scenes with illogical juxtapositions rendered in polished detail",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateAIImage(
  identity: UserIdentity,
  textContents: string[],
  style: StyleType,
  inputImageBase64?: string,
) {
  const previewImageUrl = process.env.PREVIEW_IMAGE_URL;
  if (previewImageUrl) {
    const response = await fetch(previewImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch preview image: ${response.statusText}`);
    }
    const arrayBuf = await response.arrayBuffer();
    return { base64OfImage: arrayBufferToBase64(arrayBuf) };
  }

  const client = getClient();

  const styleDescription = systemPrompts[style] ?? "";

  const prompt = inputImageBase64
    ? `Edit the provided image based on the following instructions:
${textContents.map((text) => `- ${text}`).join("\n")}
${styleDescription ? `Apply a ${styleDescription}.` : ""}
Ensure these additions are clearly represented and cohesively integrated into the existing scene.`
    : `Create an image that includes the following elements:
${textContents.map((text) => `- ${text}`).join("\n")}
${styleDescription ? `Use a ${styleDescription}.` : "Use a visually engaging style."}
Ensure all elements are clearly represented and cohesively integrated.`;

  console.log("Using prompt to generate/edit an image:", prompt);

  let openAiResponse;

  if (inputImageBase64) {
    // Convert base64 to File object
    const base64ToFile = (base64String: string, filename: string): File => {
      // Remove data URI prefix if present
      const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");

      // Convert base64 to Uint8Array
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create Blob and then File
      const blob = new Blob([bytes], { type: "image/png" });
      return new File([blob], filename, { type: "image/png" });
    };

    const imageFile = base64ToFile(inputImageBase64, "image.png");

    openAiResponse = await client.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    });
  } else {
    openAiResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "low",
    });
  }

  const imageUrl = openAiResponse.data?.[0]?.url;
  let base64OfImage = openAiResponse.data?.[0]?.b64_json;

  if (!imageUrl && !base64OfImage) {
    throw new Error("Image generation failed to return a URL or base-64 JSON.");
  }

  if (imageUrl && !base64OfImage) {
    console.log("Fetching image from URL to convert to base64:", imageUrl);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to fetch generated image: ${imageResponse.statusText}`,
      );
    }
    const arrayBuf = await imageResponse.arrayBuffer();
    base64OfImage = arrayBufferToBase64(arrayBuf);
  }

  if (!base64OfImage) throw new Error("Image generation didn't return base-64");
  return {
    base64OfImage,
    inputTokenDetails: {
      textTokens: openAiResponse.usage?.input_tokens_details.text_tokens,
      imageTokens: openAiResponse.usage?.input_tokens_details.image_tokens,
    },
  };
}

async function* streamAIImage(
  identity: UserIdentity,
  textContents: string[],
  style: StyleType,
  inputImageBase64?: string,
) {
  const client = getClient();
  const envQuality = process.env.DEFAULT_IMAGE_GENERATION_QUALITY; // TODO: Let user select the quality
  const quality: "low" | "medium" | "high" =
    envQuality === "low" || envQuality === "medium" || envQuality === "high"
      ? envQuality
      : "low";
  const styleDescription = systemPrompts[style] ?? "";

  console.log("Using quality:", quality);
  const prompt = inputImageBase64
    ? `Edit the provided image based on the following instructions:
${textContents.map((text) => `- ${text}`).join("\n")}
${styleDescription ? `Apply a ${styleDescription}.` : ""}
Ensure these additions are clearly represented and cohesively integrated into the existing scene.`
    : `Create an image that includes the following elements:
${textContents.map((text) => `- ${text}`).join("\n")}
${styleDescription ? `Use a ${styleDescription}.` : "Use a visually engaging style."}
Ensure all elements are clearly represented and cohesively integrated.`;

  console.log("Using prompt to generate/edit an image:", prompt);

  let openAiResponse;

  if (inputImageBase64) {
    // Convert base64 to File object
    const base64ToFile = (base64String: string, filename: string): File => {
      // Remove data URI prefix if present
      const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");

      // Convert base64 to Uint8Array
      const binaryString = atob(cleanBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create Blob and then File
      const blob = new Blob([bytes], { type: "image/png" });
      return new File([blob], filename, { type: "image/png" });
    };

    const imageFile = base64ToFile(inputImageBase64, "image.png");

    openAiResponse = await client.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: quality,
      stream: true,
      partial_images: 2,
    });
  } else {
    openAiResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: quality,
      stream: true,
      partial_images: 2,
    });
  }
  for await (const event of openAiResponse) {
    switch (event.type) {
      case "image_edit.completed":
      case "image_generation.completed": {
        const base64OfImage = event.b64_json;

        if (!base64OfImage)
          throw new Error("Image generation didn't return base-64");
        yield {
          base64OfImage,
          isFinal: true,
        };
        break;
      }
      case "image_edit.partial_image":
      case "image_generation.partial_image": {
        const base64OfImage = event.b64_json;

        if (!base64OfImage)
          throw new Error("Image generation didn't return base-64");

        yield {
          base64OfImage,
          isFinal: false,
        };
        break;
      }
    }
  }
}

export const isGeneratingImage = query({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return !!imageNode?.isGenerating;
  },
});

export const generateAndStoreImage = action({
  args: {
    sourceNodes: v.array(
      v.union(TextEditorExecutionSchema, ImageNodeExecutionSchema),
    ),
    nodeId: v.string(),
    whiteboardId: v.string(),
    style: Style,
  },
  handler: async (ctx, { sourceNodes, nodeId, whiteboardId, style }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const remainingImageCredits = await ctx.runQuery(
      internal.credits.getRemainingCredits,
      { userId: identity.subject, creditType: "image" },
    );
    if (remainingImageCredits < 1) {
      throw new Error("Not enough credits to generate an image.");
    }

    await ctx.runMutation(internal.credits.spendCredits, {
      userId: identity.subject,
      creditType: "image",
      creditAmount: 1,
    });

    try {
      const userPlanInfo = await ctx.runQuery(api.users.getCurrentUserPlanInfo);
      if (!userPlanInfo) throw new Error("Error when getting user's plan");

      // Cancel any existing job for this node
      const existingImageNode = await ctx.runQuery(
        internal.imageNodes.getImageNodeByNodeId,
        { nodeId },
      );
      if (existingImageNode?.isGenerating) {
        throw new Error("Image is already being generated");
      }
      if (existingImageNode?.poolId) {
        await imageDescriptionPool.cancel(ctx, existingImageNode.poolId);
        await ctx.runMutation(internal.imageNodes.editImageNode, {
          nodeId,
          updatedNode: { poolId: null },
        });
      }
      if (existingImageNode?.imageDescription) {
        await ctx.runMutation(internal.imageNodes.editImageNode, {
          nodeId,
          updatedNode: { imageDescription: null },
        });
      }

      await ctx.runMutation(internal.imageNodes.markImageNodeAsGenerating, {
        isGenerating: true,
        nodeId,
        authorExternalId: identity.subject,
        whiteboardId,
      });

      const textContents = sourceNodes
        .filter((n) => n.type === "textEditor")
        .map((n) => n.data.text);

      const imageNodes = sourceNodes.filter(
        (n): n is typeof n & { type: "image" } => n.type === "image",
      );
      let inputImageBase64: string | undefined = undefined;
      let actionType: "generate" | "edit" = "generate";

      if (imageNodes.length === 1) {
        const url = imageNodes[0]!.data.imageUrl;
        if (!url) throw new Error("Image node has no URL to edit.");
        inputImageBase64 = await fetchAsBase64(url);
        actionType = "edit";
      } else if (imageNodes.length > 1) {
        throw new Error("Ambiguous request: more than one image supplied.");
      }

      let finalBase64: string | undefined;
      for await (const chunk of streamAIImage(
        identity,
        textContents,
        style,
        inputImageBase64,
      )) {
        const bytes = Uint8Array.from(atob(chunk.base64OfImage), (c) =>
          c.charCodeAt(0),
        );
        const imageBlob = new Blob([bytes], { type: "image/png" });
        const storageId = await ctx.storage.store(imageBlob);
        await ctx.runMutation(internal.imageNodes.storeResult, {
          storageId,
          nodeId,
          whiteboardId,
          authorId: identity.subject,
          isPartialImage: true,
          isGenerating: true,
        });
        finalBase64 = chunk.isFinal ? chunk.base64OfImage : undefined;
      }
      if (!finalBase64) throw new Error("Image generation returned no data");
      // -------------------------------------------

      const bytes = Uint8Array.from(atob(finalBase64), (c) => c.charCodeAt(0));
      const imageBlob = new Blob([bytes], { type: "image/png" });
      const storageId = await ctx.storage.store(imageBlob);

      await ctx.runMutation(internal.imageNodes.storeResult, {
        storageId,
        nodeId,
        whiteboardId,
        authorId: identity.subject,
        isPartialImage: false,
        isGenerating: false,
      });

      await ctx.scheduler.runAfter(0, internal.imageLogs.logGeneration, {
        userExternalId: identity.subject,
        whiteboardId,
        nodeId,
        action: actionType,
        timestamp: BigInt(Date.now()),
        model: "gpt-image-1",
        prompt: textContents.join("\n"),
        quality: "low",
        resolution: "1024x1024",
        // streamAIImage doesn’t expose token counts, so we skip inputTokenDetails
      });

      const poolId = await imageDescriptionPool.enqueueAction(
        ctx,
        internal.imageNodes.addImageDescription,
        { imageNodeId: nodeId },
        {
          retry: {
            initialBackoffMs: 1000 * 60 * 60,
            base: 2,
            maxAttempts: 20,
          },
          runAfter: 5000,
        },
      );

      await ctx.runMutation(internal.imageNodes.editImageNode, {
        nodeId,
        updatedNode: { poolId },
      });
    } catch (error) {
      console.error(error);
    } finally {
      await ctx.runMutation(internal.imageNodes.markImageNodeAsGenerating, {
        isGenerating: false,
        nodeId,
        authorExternalId: identity.subject,
        whiteboardId,
      });
    }
  },
});
export const markImageNodeAsGenerating = internalMutation({
  args: {
    nodeId: v.string(),
    isGenerating: v.boolean(),
    authorExternalId: v.string(),
    whiteboardId: v.string(),
  },
  handler: async (
    ctx,
    { nodeId, isGenerating, authorExternalId, whiteboardId },
  ) => {
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();
    if (!imageNode) {
      const normalizedWhiteboardId = ctx.db.normalizeId(
        "whiteboards",
        whiteboardId,
      );
      if (!normalizedWhiteboardId)
        throw new Error("Could not normalize whiteboard id");
      await ctx.db.insert("imageNodes", {
        nodeId,
        isGenerating,
        authorExternalId,
        imageUrl: null,
        storageId: null,
        whiteboardId: normalizedWhiteboardId,
      });
      return;
    }

    await ctx.db.patch(imageNode._id, {
      isGenerating: isGenerating,
    });
  },
});

export const storeResult = internalMutation({
  args: {
    storageId: v.id("_storage"),
    nodeId: v.string(),
    whiteboardId: v.string(),
    authorId: v.string(),
    isPartialImage: v.boolean(),
    isGenerating: v.boolean(),
  },
  handler: async (ctx, args) => {
    const normalizedWhiteboardId = ctx.db.normalizeId(
      "whiteboards",
      args.whiteboardId,
    );
    if (!normalizedWhiteboardId) {
      throw new Error("Could not normalize whiteboard id");
    }

    // Find the node in the imageNodes table by nodeId
    const existing = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .unique();

    // Create the image URL from the storageId
    const imageUrl = await ctx.storage.getUrl(args.storageId);

    if (existing) {
      // Update the existing node with the new imageUrl
      await ctx.db.patch(existing._id, {
        imageUrl,
        storageId: args.storageId,
        isPartialImage: args.isPartialImage,
        isGenerating: args.isGenerating,
      });
    } else {
      // Insert a new image node record if it doesn't exist
      await ctx.db.insert("imageNodes", {
        nodeId: args.nodeId,
        imageUrl,
        storageId: args.storageId,
        whiteboardId: normalizedWhiteboardId,
        authorExternalId: args.authorId,
        isPartialImage: args.isPartialImage,
        isGenerating: args.isGenerating,
      });
    }
  },
});

export const uploadAndStoreImage = action({
  args: {
    file: v.bytes(),
    nodeId: v.string(),
    whiteboardId: v.string(),
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
      authorId: identity.subject,
      isPartialImage: false,
      isGenerating: false,
    });
  },
});

function getClient(): AzureOpenAI {
  // You will need to set these environment variables or edit the following values
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  // Required Azure OpenAI deployment name and API version
  const apiVersion = process.env.OPENAI_API_VERSION;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

  if (!endpoint || !apiKey || !apiVersion || !deploymentName) {
    throw new Error(
      "Please set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, OPENAI_API_VERSION, and AZURE_OPENAI_DEPLOYMENT_NAME in your environment variables.",
    );
  }

  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

export const getAllGeneratedImages = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const allGeneratedImages = await ctx.db
      .query("imageNodes")
      .withIndex("by_userId", (q) => q.eq("authorExternalId", identity.subject))
      .order("desc")
      .collect();

    return allGeneratedImages;
  },
});

export const addImageDescription = internalAction({
  args: { imageNodeId: v.string() },
  handler: async (ctx, { imageNodeId }) => {
    const imageNodeUrl = await ctx.runQuery(
      internal.imageNodes.getImageNodeUrlInternal,
      { nodeId: imageNodeId },
    );
    if (!imageNodeUrl) {
      console.log("Image node URL not found. Exiting safely");
      return;
    } // Dont throw

    // 1) Fetch blob
    const blob = await fetch(imageNodeUrl).then((res) => res.blob());
    const mimeType = blob.type;

    // 2) ArrayBuffer → base64 via chunked helper
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = arrayBufferToBase64(arrayBuffer);

    // 3) Call Gemini
    const ai = initGemini();
    const response = await ai.models.generateContent({
      contents: [
        { inlineData: { data: base64, mimeType } },
        `Generate a concise, descriptive phrase (4 - 6 words) that captures the essential subject or focal point of the image. Do not use punctuation. Do not   include phrases like "here's your description" or any other meta-commentary. Respond ONLY with the descriptive phrase itself. Focus on being accurate, specific, and brief.`,
      ],
      model: "gemini-2.5-flash",
      config: {
        thinkingConfig: {
          thinkingBudget: -1, // Model decides thinking
        },
        seed: Math.floor(Math.random() * 10000000),
      },
    });

    await ctx.runMutation(internal.imageNodes.editImageNode, {
      nodeId: imageNodeId,
      updatedNode: {
        imageDescription: response.text,
      },
    });
    console.log(
      "Generated and added description:",
      response.text,
      "to node with ID:",
      imageNodeId,
    );
    await ctx.runMutation(internal.imageNodes.editImageNode, {
      nodeId: imageNodeId,
      updatedNode: {
        poolId: null,
      },
    });
  },
});

export const editImageNode = internalMutation({
  handler: async (
    ctx,
    args: {
      nodeId: string;
      updatedNode: Partial<Doc<"imageNodes">>;
    },
  ) => {
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();
    if (!imageNode) return undefined;

    return await ctx.db.patch(imageNode._id, args.updatedNode);
  },
});

export const getImageNode = query({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const imageNode = await ctx.db
      .query("imageNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return imageNode;
  },
});
