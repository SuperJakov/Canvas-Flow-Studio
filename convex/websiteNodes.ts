import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { AzureOpenAI } from "openai";
import { TextEditorNodeData } from "./schema";
import { api } from "./_generated/api";

const TextEditorExecutionSchema = v.object({
  type: v.literal("textEditor"),
  id: v.string(),
  data: TextEditorNodeData,
});

function getClient(): AzureOpenAI {
  const endpoint = process.env.AZURE_OPENAI_WEBSITE_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_WEBSITE_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_WEBSITE_DEPLOYMENT_NAME;
  const apiVersion = "2024-02-01";

  if (!endpoint || !apiKey || !deploymentName) {
    throw new Error("Missing Azure OpenAI Website environment variables.");
  }

  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

export const generateAndStoreWebsite = action({
  args: {
    sourceNodes: v.array(TextEditorExecutionSchema),
    nodeId: v.string(),
    whiteboardId: v.string(),
  },
  handler: async (ctx, { sourceNodes, nodeId, whiteboardId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    await ctx.runMutation(internal.websiteNodes.markWebsiteNodeAsGenerating, {
      isGenerating: true,
      nodeId,
      authorExternalId: identity.subject,
      whiteboardId,
    });

    try {
      const textContents = sourceNodes.map((n) => n.data.text);
      const prompt = `
          You are an expert web developer. Your task is to create a single, self-contained HTML file based on the user's request.
          The HTML file should not have any external dependencies for CSS or JavaScript. All styles and scripts must be embedded within the HTML file.
          The user's request is as follows:
          ---
          ${textContents.join("\n")}
          ---
          Please provide only the HTML code, without any explanations or markdown formatting.
      `;

      const client = getClient();
      const response = await client.chat.completions.create({
        model: process.env.AZURE_OPENAI_WEBSITE_DEPLOYMENT_NAME!,
        messages: [{ role: "user", content: prompt }],
      });

      const htmlContent = response.choices[0]?.message?.content;
      if (!htmlContent) {
        throw new Error("Failed to generate website content.");
      }

      await ctx.runMutation(internal.websiteNodes.storeResult, {
        nodeId,
        whiteboardId,
        authorId: identity.subject,
        srcDoc: htmlContent,
        isGenerating: false,
      });
    } catch (error) {
      console.error(error);
    } finally {
      await ctx.runMutation(internal.websiteNodes.markWebsiteNodeAsGenerating, {
        isGenerating: false,
        nodeId,
        authorExternalId: identity.subject,
        whiteboardId,
      });
    }
  },
});

export const markWebsiteNodeAsGenerating = internalMutation({
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
    const websiteNode = await ctx.db
      .query("websiteNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();
    if (!websiteNode) {
      const normalizedWhiteboardId = ctx.db.normalizeId(
        "whiteboards",
        whiteboardId,
      );
      if (!normalizedWhiteboardId)
        throw new Error("Could not normalize whiteboard id");
      await ctx.db.insert("websiteNodes", {
        nodeId,
        isGenerating,
        authorExternalId,
        srcDoc: null,
        whiteboardId: normalizedWhiteboardId,
      });
      return;
    }

    await ctx.db.patch(websiteNode._id, {
      isGenerating: isGenerating,
    });
  },
});

export const storeResult = internalMutation({
  args: {
    nodeId: v.string(),
    whiteboardId: v.string(),
    authorId: v.string(),
    srcDoc: v.string(),
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

    const existing = await ctx.db
      .query("websiteNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        srcDoc: args.srcDoc,
        isGenerating: args.isGenerating,
      });
    } else {
      await ctx.db.insert("websiteNodes", {
        nodeId: args.nodeId,
        srcDoc: args.srcDoc,
        whiteboardId: normalizedWhiteboardId,
        authorExternalId: args.authorId,
        isGenerating: args.isGenerating,
      });
    }
  },
});

export const getWebsiteNode = query({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const websiteNode = await ctx.db
      .query("websiteNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return websiteNode;
  },
});

export const isGeneratingWebsite = query({
  args: {
    nodeId: v.string(),
  },
  handler: async (ctx, { nodeId }) => {
    const websiteNode = await ctx.db
      .query("websiteNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", nodeId))
      .first();

    return !!websiteNode?.isGenerating;
  },
});
