import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { creditsAggregate } from "./aggregates";
import { CreditType } from "./schema";
import { internalMutation } from "./functions";

export const getRemainingCreditsPublic = query({
  args: {
    creditType: CreditType,
  },
  handler: async (ctx, { creditType }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const credits = await creditsAggregate.sum(ctx, {
      bounds: { prefix: [userId, creditType] },
    });

    return credits;
  },
});

export const getRemainingCredits = internalQuery({
  args: {
    userId: v.string(),
    creditType: CreditType,
  },
  handler: async (ctx, { userId, creditType }) => {
    const imageCredits = await creditsAggregate.sum(ctx, {
      bounds: { prefix: [userId, creditType] },
    });

    return imageCredits;
  },
});

export const spendCredits = internalMutation({
  args: {
    userId: v.string(),
    creditType: CreditType, // Or use your CreditType validator
    creditAmount: v.number(), // Positive number, how many to spend
  },
  handler: async (ctx, { creditType, userId, creditAmount }) => {
    // Insert a transaction with a negative amount to represent spending a credit
    const id = await ctx.db.insert("transactions", {
      userId,
      creditType,
      amount: creditAmount * -1,
      type: "usage",
      updatedAt: Date.now(),
    });
    const doc = await ctx.db.get(id);
    await creditsAggregate.insert(ctx, doc!);
  },
});

export const addCredits = internalMutation({
  args: {
    userId: v.string(),
    creditType: CreditType, // Or use your CreditType validator
    creditAmount: v.number(), // Positive number, how many to add
    type: v.union(
      v.literal("trial"),
      v.literal("subscription"),
      v.literal("topup"),
      v.literal("adjustment"),
      v.literal("refund"),
      v.literal("signup"),
    ),
  },
  handler: async (ctx, { creditType, userId, creditAmount, type }) => {
    const id = await ctx.db.insert("transactions", {
      userId,
      creditType,
      amount: creditAmount,
      type,
      updatedAt: Date.now(),
    });
    const doc = await ctx.db.get(id);
    await creditsAggregate.insert(ctx, doc!);
  },
});
