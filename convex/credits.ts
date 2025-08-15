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

export const FREE_CREDITS = {
  image: 20,
  speech: 5,
  website: 1,
};

export const refillFreeCredits = internalMutation({
  handler: async (ctx) => {
    const freeUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("plan"), "Free"))
      .collect();

    for (const user of freeUsers) {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (!user.lastCreditTopUp || user.lastCreditTopUp < thirtyDaysAgo) {
        await ctx.runMutation(internal.credits.addCredits, {
          userId: user.externalId,
          creditType: "image",
          creditAmount: FREE_CREDITS.image,
          type: "trial",
        });
        await ctx.runMutation(internal.credits.addCredits, {
          userId: user.externalId,
          creditType: "speech",
          creditAmount: FREE_CREDITS.speech,
          type: "trial",
        });
        await ctx.runMutation(internal.credits.addCredits, {
          userId: user.externalId,
          creditType: "website",
          creditAmount: FREE_CREDITS.website,
          type: "trial",
        });

        await ctx.db.patch(user._id, {
          lastCreditTopUp: BigInt(Date.now()),
        });
      }
    }
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

export const manualRefill = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("externalId"), userId))
      .first();

    if (user && user.plan === "Free") {
      await ctx.runMutation(internal.credits.addCredits, {
        userId: user.externalId,
        creditType: "image",
        creditAmount: FREE_CREDITS.image,
        type: "trial",
      });
      await ctx.runMutation(internal.credits.addCredits, {
        userId: user.externalId,
        creditType: "speech",
        creditAmount: FREE_CREDITS.speech,
        type: "trial",
      });
      await ctx.runMutation(internal.credits.addCredits, {
        userId: user.externalId,
        creditType: "website",
        creditAmount: FREE_CREDITS.website,
        type: "trial",
      });

      await ctx.db.patch(user._id, {
        lastCreditTopUp: BigInt(Date.now()),
      });
    }
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
