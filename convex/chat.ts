import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api } from "./_generated/api";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const getMessages = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", {
      isUser: true,
      message: args.message,
      sessionId: args.sessionId,
    });

    await ctx.scheduler.runAfter(0, api.chat.getAIResponse, {
      message: args.message,
      sessionId: args.sessionId,
    });
  },
});

export const getAIResponse = action({
  args: {
    message: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.runQuery(api.docs.getDocsContent, {});
    const messages = await ctx.runQuery(api.chat.getMessages, {
      sessionId: args.sessionId,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `You are an AI assistant for the app. You can only answer questions about the app. Use the following documentation as your source of truth: ${docs}` }],
        },
        {
          role: "model",
          parts: [{ text: "I understand. I will only answer questions about the app using the provided documentation." }],
        },
        ...messages.map((msg) => ({
          role: msg.isUser ? "user" : "model",
          parts: [{ text: msg.message }],
        })),
      ],
    });

    const result = await chat.sendMessage(args.message);
    const response = await result.response;
    const text = response.text();

    await ctx.runMutation(api.chat.storeAIResponse, {
      message: text,
      sessionId: args.sessionId,
    });
  },
});

export const storeAIResponse = mutation({
    args: {
        message: v.string(),
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("chatMessages", {
            isUser: false,
            message: args.message,
            sessionId: args.sessionId,
        });
    },
});
