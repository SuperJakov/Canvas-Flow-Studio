import { internalQuery, query, type QueryCtx } from "./_generated/server";
import { internalMutation } from "./functions";
import type { UserJSON } from "@clerk/backend";
import { v, type Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userAttributes = {
      firstName: null,
      lastName: null,
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

export const getUserByExternalId = internalQuery({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", args.externalId))
      .unique();
  },
});

/**
 * Internal mutation to set the Stripe customer ID for a user.
 */
export const setStripeCustomerId = internalMutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, { userId, stripeCustomerId }) => {
    await ctx.db.patch(userId, { stripeCustomerId });
  },
});

export const updateUserSubscription = internalMutation({
  args: {
    externalId: v.string(),
    plan: v.union(v.literal("Free"), v.literal("Plus"), v.literal("Pro")),
  },
  handler: async (ctx, { externalId, plan }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
      .unique();

    if (!user) {
      throw new Error(
        `[Webhook] User with externalId ${externalId} not found.`,
      );
    }

    await ctx.db.patch(user._id, {
      plan,
    });
  },
});

export const getCurrentUserPlanInfo = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const plan = user.plan;
    if (!plan || plan === "Free") {
      return {
        plan: "Free",
      };
    }
    const userSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_userExternalId", (q) =>
        q.eq("userExternalId", user.externalId),
      )
      .first(); // Only 1 should be
    if (!userSubscription) {
      throw new Error(
        `User ${user._id} has plan '${user.plan}' but no subscription record was found.`,
      );
    }
    return { ...userSubscription, plan };
  },
});

export const getCurrentUserPlan = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return user.plan ?? "Free"; // Default to "Free" if plan is not set
  },
});
