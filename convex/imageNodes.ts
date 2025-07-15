import { type Infer, v } from "convex/values";
import { action, query } from "./_generated/server";
import { internalMutation } from "./functions";
import { Style, TextEditorNodeData } from "./schema";
import { AzureOpenAI } from "openai";
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

async function generateAIImage(
  identity: UserIdentity,
  textContents: string[],
  style: StyleType,
  inputImageBase64?: string,
): Promise<string> {
  const previewImageUrl = process.env.PREVIEW_IMAGE_URL;
  if (previewImageUrl) {
    const response = await fetch(previewImageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch preview image: ${response.statusText}`);
    }
    const arrayBuf = await response.arrayBuffer();
    return arrayBufferToBase64(arrayBuf);
  }

  const client = getClient();
  const getStyledPrompt = (basePrompt: string, style: StyleType = "auto") => {
    const stylePrompt = systemPrompts[style] ?? systemPrompts.auto;
    return stylePrompt ? `${stylePrompt}\n\n${basePrompt}` : basePrompt;
  };

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

  // Apply the style to the prompt (assuming you have a 'selectedStyle' variable)
  const styledPrompt = getStyledPrompt(prompt, style);
  console.log("Using prompt to generate/edit an image:", styledPrompt);

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
  return base64OfImage;
}

export const generateAndStoreImage = action({
  args: {
    sourceNodes: v.array(
      v.union(TextEditorExecutionSchema, ImageNodeExecutionSchema),
    ),
    nodeId: v.string(),
    whiteboardId: v.id("whiteboards"),
    style: Style,
  },
  handler: async (ctx, { sourceNodes, nodeId, whiteboardId, style }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userPlanInfo = await ctx.runQuery(api.users.getCurrentUserPlanInfo);
    if (!userPlanInfo) throw new Error("Error when getting user's plan");

    const config = getRateLimitConfigForPlan(userPlanInfo.plan);
    const { ok, retryAfter } = await rateLimiter.limit(ctx, "imageGeneration", {
      key: identity.subject,
      config,
    });
    if (!ok) {
      throw new Error(
        `Rate limit reached. Try after: ${Math.ceil(retryAfter / 1000)} s`,
      );
    }

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

    const base64OfImage = await generateAIImage(
      identity,
      textContents,
      style,
      inputImageBase64,
    );

    const bytes = Uint8Array.from(atob(base64OfImage), (c) => c.charCodeAt(0));
    const imageBlob = new Blob([bytes], { type: "image/png" });
    const storageId = await ctx.storage.store(imageBlob);

    await ctx.runMutation(internal.imageNodes.storeResult, {
      storageId,
      nodeId,
      whiteboardId,
      authorId: identity.subject,
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
    });
  },
});

export const storeResult = internalMutation({
  args: {
    storageId: v.id("_storage"),
    nodeId: v.string(),
    whiteboardId: v.id("whiteboards"),
    authorId: v.string(),
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
        authorExternalId: args.authorId,
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
      authorId: identity.subject,
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
