"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

// Define the Plan type for type safety
type Tier = "Plus" | "Pro";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const priceIds: Record<Tier, string> = {
  Plus: process.env.PLUS_MONTHLY_SUBSCRIPTION_PRODUCT_ID!,
  Pro: process.env.PRO_MONTHLY_SUBSCRIPTION_PRODUCT_ID!,
};

const priceIdToTier: Record<string, Tier> = {
  [process.env.PLUS_MONTHLY_SUBSCRIPTION_PRODUCT_ID!]: "Plus",
  [process.env.PRO_MONTHLY_SUBSCRIPTION_PRODUCT_ID!]: "Pro",
};

/**
 * Creates a Stripe Checkout Session for a given tier and returns the URL.
 * Handles both new subscriptions and upgrades from existing subscriptions.
 */
export const getCheckoutSessionUrl = action({
  args: {
    tier: v.union(v.literal("Plus"), v.literal("Pro")),
  },
  handler: async (ctx, { tier }): Promise<string | null> => {
    const hostingUrl = process.env.HOSTING_URL;
    if (!hostingUrl) {
      throw new Error("HOSTING_URL environment variable is not set.");
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }
    const clerkUserId = identity.subject;
    console.log(clerkUserId);

    const user = await ctx.runQuery(internal.users.getUserByExternalId, {
      externalId: clerkUserId,
    });

    if (!user) {
      throw new Error("User not found in Convex database.");
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create a new Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
      const email = identity.email;
      if (!email) {
        throw new Error("User email not found in authentication token.");
      }

      const newCustomer = await stripe.customers.create({
        email: email,
        metadata: {
          clerkUserId: clerkUserId,
        },
      });

      stripeCustomerId = newCustomer.id;

      await ctx.runMutation(internal.users.setStripeCustomerId, {
        userId: user._id,
        stripeCustomerId: stripeCustomerId,
      });
    }

    // Check if user has an existing subscription and determine if it's an upgrade or downgrade
    const currentPlan = user.plan ?? "Free";
    const tierHierarchy = { Free: 0, Plus: 1, Pro: 2 };
    const isUpgrade = tierHierarchy[currentPlan] < tierHierarchy[tier];
    const isDowngrade = tierHierarchy[currentPlan] > tierHierarchy[tier];

    // If user has an active subscription
    if (currentPlan !== "Free") {
      try {
        // For upgrades, redirect to billing portal
        if (isUpgrade) {
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${hostingUrl}/pricing`,
          });
          return portalSession.url;
        }

        // For downgrades, directly update the subscription
        if (isDowngrade) {
          const subscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "active",
            limit: 1,
          });

          if (subscriptions.data.length === 0) {
            throw new Error("No active subscription found");
          }

          const subscription = subscriptions.data[0];
          if (!subscription?.items.data[0]) {
            throw new Error("Invalid subscription data");
          }

          const priceId = priceIds[tier];

          // Update the subscription with the new price
          await stripe.subscriptions.update(subscription.id, {
            items: [
              {
                id: subscription.items.data[0].id,
                price: priceId,
              },
            ],
            proration_behavior: "none",
          });

          // Sync the updated subscription data
          await ctx.scheduler.runAfter(0, internal.stripe.syncStripeDataToDb, {
            subject: clerkUserId,
          });

          return `${hostingUrl}/pricing?downgrade=success`;
        }
      } catch (error) {
        console.error("Error handling subscription change:", error);
        // Fallback to a Checkout session if the portal/update fails
      }
    }

    // Create new checkout session for new subscriptions or if other methods failed
    const priceId = priceIds[tier];
    if (!priceId) {
      throw new Error(`Price ID for tier "${tier}" is not configured.`);
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          tier: tier,
          clerkUserId: clerkUserId,
          isUpgrade: isUpgrade.toString(),
          previousPlan: currentPlan,
        },
        success_url: `${hostingUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${hostingUrl}/pricing`,
        // If user has an existing subscription, allow them to replace it
        ...(currentPlan !== "Free" && {
          subscription_data: {
            metadata: {
              clerkUserId: clerkUserId,
              tier: tier,
              previousPlan: currentPlan,
            },
          },
        }),
      });

      return session.url;
    } catch (error) {
      console.error("Stripe session creation failed:", error);
      return null;
    }
  },
});

export const cancelSubscription = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;

    // Get user from database
    const user = await ctx.runQuery(internal.users.getUserByExternalId, {
      externalId: clerkUserId,
    });

    if (!user) {
      throw new Error("User not found in database");
    }

    if (!user.stripeCustomerId) {
      throw new Error("No Stripe customer found for this user");
    }

    try {
      // Get active subscriptions for the customer
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        throw new Error("No active subscription found");
      }
      const subscription = subscriptions.data[0];
      if (!subscription) throw new Error("No subscription found");
      // Cancel the subscription at period end
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });

      // Note: The subscription status will be updated via webhook when it actually ends
      return {
        success: true,
        message:
          "Subscription will be canceled at the end of the billing period",
      };
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  },
});

/**
 * Creates a Stripe Billing Portal Session to allow users to manage their subscription.
 */
export const getCustomerBillingPortalUrl = action({
  args: {
    returnUrl: v.string(),
  },
  handler: async (ctx, { returnUrl }) => {
    // 1. Authenticate user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }
    const clerkUserId = identity.subject;

    // 2. Find the user in our Convex database
    const user = await ctx.runQuery(internal.users.getUserByExternalId, {
      externalId: clerkUserId,
    });

    if (!user) {
      throw new Error("User not found in Convex database.");
    }

    // 3. Ensure the user has a Stripe Customer ID
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      throw new Error("Stripe customer not found for this user.");
    }

    // 4. Create the Billing Portal Session
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
      });

      return session.url;
    } catch (error) {
      console.error("Error creating billing portal session:", error);
      return null;
    }
  },
});

export const syncStripeDataToDb = internalAction({
  args: {
    subject: v.string(),
  },
  handler: async (ctx, { subject }) => {
    const user = await ctx.runQuery(internal.users.getUserByExternalId, {
      externalId: subject,
    });

    if (!user) throw new Error("User not found");
    const { stripeCustomerId } = user;
    if (!stripeCustomerId) throw new Error("User does not have customer id");

    const subscription = (
      await stripe.subscriptions.list({
        customer: stripeCustomerId,
        limit: 1,
        status: "active",
      })
    ).data[0];

    // If no active subscription found, set plan to Free
    if (!subscription) {
      await ctx.runMutation(internal.users.updateUserSubscription, {
        externalId: subject,
        plan: "Free",
      });
      return;
    }

    // Map Stripe status to our schema status
    const statusMap: Record<
      string,
      | "incomplete"
      | "incomplete_expired"
      | "trialing"
      | "active"
      | "past_due"
      | "canceled"
      | "unpaid"
    > = {
      incomplete: "incomplete",
      incomplete_expired: "incomplete_expired",
      trialing: "trialing",
      active: "active",
      past_due: "past_due",
      canceled: "canceled",
      unpaid: "unpaid",
    };

    const status = statusMap[subscription.status] ?? "incomplete";

    // Get the price ID and determine the plan
    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      throw new Error("No price ID found in subscription items");
    }

    // Map price ID to tier
    const tier = priceIdToTier[priceId];
    if (!tier) {
      console.error("Available price IDs:", Object.keys(priceIdToTier));
      console.error("Received price ID:", priceId);
      throw new Error(`Price ID ${priceId} not mapped to any tier`);
    }

    // Update user's plan based on subscription status
    if (status === "active" || status === "trialing") {
      await ctx.runMutation(internal.users.updateUserSubscription, {
        externalId: subject,
        plan: tier,
      });
    } else {
      await ctx.runMutation(internal.users.updateUserSubscription, {
        externalId: subject,
        plan: "Free",
      });
    }

    // Now save all subscription data
    await ctx.runMutation(internal.subscriptions.upsertSubscription, {
      userExternalId: user.externalId,
      subscriptionId: subscription.id,
      status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: BigInt(subscription.start_date * 1000), // Convert to milliseconds
      current_period_end: subscription.cancel_at
        ? BigInt(subscription.cancel_at)
        : null,
      canceled_at: subscription.canceled_at
        ? BigInt(subscription.canceled_at * 1000)
        : BigInt(0), // Convert to milliseconds
      price_id: priceId,
      last_status_sync_at: BigInt(Date.now()),
    });
  },
});

// Helper function to extract Clerk User ID and schedule a database sync.
// This centralizes the logic for finding the user associated with a Stripe event.
const scheduleSyncForUser = async (
  ctx: ActionCtx,
  eventObject: {
    customer?: string | Stripe.Customer | Stripe.DeletedCustomer | null;
    metadata?: { clerkUserId?: string | null } | null;
  },
  eventType: string,
) => {
  let clerkUserId: string | undefined | null;

  // Attempt to get clerkUserId directly from the event object's metadata.
  // This is common for Checkout Sessions and Subscriptions.
  clerkUserId = eventObject.metadata?.clerkUserId;

  // If not found, and a customer ID is available, fetch the customer
  // to get the ID from their metadata. This is the fallback for most objects
  // like Invoices and Payment Intents.
  if (
    !clerkUserId &&
    eventObject.customer &&
    typeof eventObject.customer === "string"
  ) {
    try {
      const customer = (await stripe.customers.retrieve(
        eventObject.customer,
      )) as Stripe.Customer;
      clerkUserId = customer.metadata.clerkUserId;
    } catch (error) {
      console.error(
        `[Webhook] Error retrieving customer ${eventObject.customer} for event ${eventType}:`,
        error,
      );
      // We can't proceed without the customer object, so we stop here.
      return;
    }
  }

  if (!clerkUserId) {
    const customerId =
      typeof eventObject.customer === "string" ? eventObject.customer : "N/A";
    console.error(
      `[Webhook] Could not find clerkUserId for event ${eventType} (Customer ID: ${customerId}). Skipping sync.`,
    );
    return;
  }

  // Schedule the sync task to run immediately.
  await ctx.scheduler.runAfter(0, internal.stripe.syncStripeDataToDb, {
    subject: clerkUserId,
  });

  console.log(
    `[Webhook] Scheduled sync for event ${eventType} for user ${clerkUserId}.`,
  );
};

export const handleEvent = internalAction({
  handler: async (ctx, { event }: { event: Stripe.Event }) => {
    const stripeEvent = event;

    try {
      // Log every event received for auditing and debugging purposes.
      console.log(`[Webhook] Received Stripe event: ${stripeEvent.type}`);

      switch (stripeEvent.type) {
        // This event is critical for starting a subscription.
        // We handle it separately for more specific logging.
        case "checkout.session.completed": {
          const session = stripeEvent.data.object;
          const { clerkUserId, tier } = session.metadata ?? {};

          if (!clerkUserId || !tier) {
            throw new Error(
              "Missing metadata: clerkUserId or tier from checkout session.",
            );
          }

          // Sync the user's subscription state.
          await scheduleSyncForUser(ctx, session, stripeEvent.type);

          console.log(
            `[Webhook] User ${clerkUserId} successfully subscribed to ${tier}.`,
          );
          break;
        }

        // --- Subscription Lifecycle Events ---
        // These events indicate a direct change to the subscription status.
        // Syncing ensures our database reflects the new state.
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
        case "customer.subscription.paused":
        case "customer.subscription.resumed":
        case "customer.subscription.pending_update_applied":
        case "customer.subscription.pending_update_expired":
        case "customer.subscription.trial_will_end":

        // --- Invoice & Payment Events ---
        // These events are crucial for managing access based on payment status.
        // A failed payment might lead to a 'past_due' status, which our sync function handles.
        case "invoice.paid":
        case "invoice.payment_failed":
        case "invoice.payment_action_required":
        case "invoice.upcoming":
        case "invoice.marked_uncollectible":
        case "invoice.payment_succeeded":

        // --- Payment Intent Events ---
        // Lower-level events that also signal payment status changes.
        case "payment_intent.succeeded":
        case "payment_intent.payment_failed":
        case "payment_intent.canceled":
          await scheduleSyncForUser(
            ctx,
            stripeEvent.data.object,
            stripeEvent.type,
          );
          break;

        default: {
          console.log(`[Webhook] Unhandled event type: ${stripeEvent.type}`);
        }
      }
    } catch (error) {
      console.error(
        `[Webhook] Error processing event ${stripeEvent.type}:`,
        error,
      );
      // Depending on your alerting setup, you might want to re-throw or
      // send a notification here. For now, we log and acknowledge the event.
    }
  },
});

export const reactivateSubscription = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated.");
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-06-30.basil",
    });

    // Get the user's Stripe customer ID from your database
    const userRecord = await ctx.runQuery(internal.users.getUserByExternalId, {
      externalId: identity.subject,
    });

    if (!userRecord?.stripeCustomerId) {
      throw new Error("No active subscription found to reactivate.");
    }

    // Get active subscriptions for the customer
    const subscriptions = await stripe.subscriptions.list({
      customer: userRecord.stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }
    const subscription = subscriptions.data[0];
    if (!subscription) throw new Error("No subscription found");

    // Webhook updates the subscription status to active
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });

    return { success: true };
  },
});
