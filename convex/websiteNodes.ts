import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { AzureOpenAI } from "openai";
import { TextEditorNodeData } from "./schema";

const TextEditorExecutionSchema = v.object({
  type: v.literal("textEditor"),
  id: v.string(),
  data: TextEditorNodeData,
});

function getClient(): AzureOpenAI {
  const endpoint = process.env.AZURE_OPENAI_WEBSITE_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_WEBSITE_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_WEBSITE_DEPLOYMENT_NAME;
  const apiVersion = "2025-04-01-preview";

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

    const remainingCredits = await ctx.runQuery(
      internal.credits.getRemainingCredits,
      { userId: identity.subject, creditType: "website" },
    );

    if (remainingCredits < 1) {
      throw new Error("Not enough credits to generate a website.");
    }

    await ctx.runMutation(internal.credits.spendCredits, {
      userId: identity.subject,
      creditType: "website",
      creditAmount: 1,
    });

    await ctx.runMutation(internal.websiteNodes.markWebsiteNodeAsGenerating, {
      isGenerating: true,
      nodeId,
      authorExternalId: identity.subject,
      whiteboardId,
    });

    try {
      const textContents = sourceNodes.map((n) => n.data.text);
      const instruction = `
      You are an expert web developer with a specialization in using Tailwind CSS to create modern, visually appealing, and responsive websites. Your task is to create a single, self-contained HTML file based on the user's request, strictly following the requirements below.
      
      **Core Philosophy: Tailwind First**
      
      You **must** use Tailwind CSS for all styling, layout, and design. Your primary goal is to leverage its utility classes to build the entire interface. You should only write custom CSS in a \`<style>\` tag for effects that are genuinely not possible with Tailwind's utility classes (e.g., complex multi-step animations, or very specific pseudo-element styling).
      
      **Key Requirements:**
      
      1.  **Single File Output:** The final output must be a single HTML file.
      2.  **Mandatory Libraries:** You must include the following libraries in the \`<head>\` section of the HTML if you use them. Do not use any other external libraries.
      
          * **Tailwind CSS (Required for ALL styling):**
              \`<script src="https://cdn.tailwindcss.com"></script>\`
      
          * **GSAP (For advanced animations):**
              \`<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>\`
      
          * **Chart.js (For charts and graphs):**
              \`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\`
      
      3.  **Custom Fonts:**
          * To use custom fonts, you **must** import them from Google Fonts by adding a \`<link>\` tag in the \`<head>\`. For example:
              \`<link rel="preconnect" href="https://fonts.googleapis.com">\`
              \`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\`
              \`<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">\`
          * You will then need to extend the Tailwind configuration to make the font available. Place a \`<script>\` tag immediately after the Tailwind CSS script tag to configure it. For example:
              \`\`\`html
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = {
                  theme: {
                    extend: {
                      fontFamily: {
                        sans: ['Roboto', 'sans-serif'],
                      }
                    }
                  }
                }
              </script>
              \`\`\`
      
      4.  **Responsiveness:** The website **must** be fully responsive. Use Tailwind's responsive prefixes (e.g., \`md:\`, \`lg:\`) to ensure a great experience on all screen sizes.
      5.  **Content and Structure:** Interpret the user's request to create a logical content structure using appropriate semantic HTML tags (e.g., \`<header>\`, \`<main>\`, \`<footer>\`).
      6. This will be embedded into another website. Don't add any elements which might redirect the user (e.g. <a>) or lag the site.
      
      Please provide only the complete HTML code for the file, without any explanations or markdown formatting.`;

      const prompt = `
      The user's request is as follows:
      ${textContents.join("\n")}`;

      const client = getClient();

      const response = await client.responses.create({
        model: "gpt-5",
        reasoning: { effort: "medium" },
        instructions: instruction,
        input: prompt,
        max_output_tokens: 40000,
      });

      console.log("Output tokens", response.usage?.output_tokens);
      console.log(
        "Output tokens details",
        response.usage?.output_tokens_details,
      );

      const htmlContent = response.output_text;
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

export const getWebsiteGenerationRateLimit = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const remainingCredits = await ctx.runQuery(
      internal.credits.getRemainingCredits,
      {
        userId: identity.subject,
        creditType: "website",
      },
    );
    if (remainingCredits < 1) {
      return {
        isRateLimited: true,
      };
    }
    return { isRateLimited: false };
  },
});
