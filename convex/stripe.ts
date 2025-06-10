"use node";

import Stripe from "stripe";
import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Define the Plan type for type safety
type Tier = "Plus" | "Pro";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
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

    // Check if user has an existing subscription and needs to upgrade
    const currentPlan = user.plan ?? "Free";
    const tierHierarchy = { Free: 0, Plus: 1, Pro: 2 };
    const isUpgrade = tierHierarchy[currentPlan] < tierHierarchy[tier];

    // If user has an active subscription and is trying to upgrade
    if (isUpgrade && currentPlan !== "Free") {
      try {
        // Get all subscriptions for the customer
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "active",
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const currentSubscription = subscriptions.data[0];
          if (!currentSubscription) {
            throw new Error(
              "Active subscription not found despite subscription list indicating existence.",
            );
          }
          const newPriceId = priceIds[tier];

          if (!newPriceId) {
            throw new Error(`Price ID for tier "${tier}" is not configured.`);
          }

          // Create a checkout session for subscription upgrade
          // This will handle the payment for the upgrade and update the subscription
          const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: newPriceId, quantity: 1 }],
            subscription_data: {
              metadata: {
                clerkUserId: clerkUserId,
                tier: tier,
                previousPlan: currentPlan,
                isUpgrade: "true",
              },
              // This will replace the existing subscription
              proration_behavior: "create_prorations",
            },
            metadata: {
              tier: tier,
              clerkUserId: clerkUserId,
              isUpgrade: "true",
              previousPlan: currentPlan,
              existingSubscriptionId: currentSubscription.id,
            },
            success_url: `${hostingUrl}/success?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
            cancel_url: `${hostingUrl}/pricing`,
          });

          console.log(
            `Creating upgrade checkout session from ${currentPlan} to ${tier} for user ${clerkUserId}`,
          );
          return session.url;
        }
      } catch (error) {
        console.error("Error creating upgrade checkout session:", error);
        // Fall through to create a new checkout session if upgrade fails
      }
    }

    // Create new checkout session for new subscriptions or if upgrade failed
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
    if (!subscription) throw new Error("Subscription not found");

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

    // Now save all data we need
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
      price_id: subscription.items.data[0]?.price.id ?? "",
      last_status_sync_at: BigInt(Date.now()),
    });
  },
});

export const handleEvent = internalAction({
  args: { event: v.any() }, // The validated Stripe.Event object
  handler: async (ctx, { event }) => {
    const stripeEvent = event as Stripe.Event;

    try {
      switch (stripeEvent.type) {
        // This event occurs when a checkout session is successfully completed.
        // It's the primary way to start a new subscription.
        case "checkout.session.completed": {
          const session = stripeEvent.data.object;
          const { clerkUserId, tier } = session.metadata ?? {};

          if (!clerkUserId || !tier) {
            throw new Error(
              "Missing metadata: clerkUserId or tier from checkout session.",
            );
          }
          if (!session.subscription) {
            throw new Error("Checkout session did not create a subscription.");
          }

          // Validate tier is a valid Plan
          if (tier !== "Plus" && tier !== "Pro") {
            throw new Error(`Invalid tier: ${tier}`);
          }

          await ctx.runMutation(internal.users.updateUserSubscription, {
            externalId: clerkUserId,
            plan: tier,
          });

          await ctx.scheduler.runAfter(0, internal.stripe.syncStripeDataToDb, {
            subject: clerkUserId,
          });

          console.log(`[Webhook] User ${clerkUserId} subscribed to ${tier}.`);
          break;
        }

        // This event occurs when a subscription is updated, e.g.,
        // when a user upgrades or downgrades their plan.
        case "customer.subscription.updated": {
          const subscription = stripeEvent.data.object;
          const { clerkUserId } = subscription.metadata;

          if (!clerkUserId) {
            // Fallback: If metadata is missing on the subscription, get it from the customer
            const customer = (await stripe.customers.retrieve(
              subscription.customer as string,
            )) as Stripe.Customer;
            const customerClerkId = customer.metadata.clerkUserId;
            if (!customerClerkId)
              throw new Error("Clerk User ID not found in customer metadata.");

            await updateSubscription(customerClerkId);
          } else {
            await updateSubscription(clerkUserId);
          }

          async function updateSubscription(id: string) {
            // Get the price ID from the subscription item
            const priceId = subscription.items.data[0]?.price.id;
            if (!priceId) {
              throw new Error("No price ID found in subscription items.");
            }

            // Map price ID to tier
            const tier = priceIdToTier[priceId];
            if (!tier) {
              // Log all available price IDs for debugging
              console.error("Available price IDs:", Object.keys(priceIdToTier));
              console.error("Received price ID:", priceId);
              throw new Error(`Price ID ${priceId} not mapped to any tier.`);
            }

            await ctx.runMutation(internal.users.updateUserSubscription, {
              externalId: id,
              plan: tier,
            });

            await ctx.scheduler.runAfter(
              0,
              internal.stripe.syncStripeDataToDb,
              {
                subject: id,
              },
            );

            console.log(
              `[Webhook] User ${id}'s subscription updated to ${tier} (price: ${priceId}).`,
            );
          }
          break;
        }

        // This event occurs when a subscription is canceled by the user or
        // due to payment failure after all retries.
        case "customer.subscription.deleted": {
          const subscription = stripeEvent.data.object;
          const customer = (await stripe.customers.retrieve(
            subscription.customer as string,
          )) as Stripe.Customer;
          const clerkUserId = customer.metadata.clerkUserId;

          if (!clerkUserId) {
            throw new Error(
              "Clerk User ID not found in customer metadata for subscription deletion.",
            );
          }

          // Revert the user to the "Free" plan
          await ctx.runMutation(internal.users.updateUserSubscription, {
            externalId: clerkUserId,
            plan: "Free",
          });

          await ctx.scheduler.runAfter(0, internal.stripe.syncStripeDataToDb, {
            subject: clerkUserId,
          });

          console.log(
            `[Webhook] User ${clerkUserId}'s subscription deleted. Reset to Free.`,
          );
          break;
        }

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
