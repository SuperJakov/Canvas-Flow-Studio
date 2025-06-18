import { internalMutation } from "./functions";
import { v } from "convex/values";

export const upsertSubscription = internalMutation({
  args: {
    userExternalId: v.string(),
    subscriptionId: v.string(),
    status: v.union(
      v.literal("incomplete"),
      v.literal("incomplete_expired"),
      v.literal("trialing"),
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("unpaid"),
    ),
    cancel_at_period_end: v.boolean(),
    current_period_start: v.int64(),
    current_period_end: v.union(v.int64(), v.null()),
    canceled_at: v.int64(),
    price_id: v.string(),
    last_status_sync_at: v.int64(),
  },
  handler: async (ctx, args) => {
    // Check if subscription already exists
    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_subscriptionId", (q) =>
        q.eq("subscriptionId", args.subscriptionId),
      )
      .unique();

    if (existingSubscription) {
      // Update existing subscription
      await ctx.db.patch(existingSubscription._id, args);
    } else {
      // Create new subscription
      await ctx.db.insert("subscriptions", args);
    }
  },
});
