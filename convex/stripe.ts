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

/**
 * Creates a Stripe Checkout Session for a given tier and returns the URL.
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
    const clerkUserId = identity.subject; // This is the externalId
    console.log(clerkUserId);
    const user = await ctx.runQuery(internal.users.getUserByExternalId, {
      externalId: clerkUserId,
    });

    if (!user) {
      throw new Error("User not found in Convex database.");
    }

    let stripeCustomerId = user.stripeCustomerId;

    // 3. Create a new Stripe customer if one doesn't exist
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

    const priceId = priceIds[tier];
    if (!priceId) {
      throw new Error(`Price ID for tier "${tier}" is not configured.`);
    }

    // 5. Create the Stripe Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          tier: tier,
          // Storing the Clerk User ID is preferred for webhook lookups
          clerkUserId: clerkUserId,
        },
        success_url: `${hostingUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${hostingUrl}/pricing`,
      });

      return session.url;
    } catch (error) {
      console.error("Stripe session creation failed:", error);
      return null;
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
            // The price object contains the tier info. Using nickname is a good practice.
            const planNickname = subscription.items.data[0]?.price.nickname;
            if (
              !planNickname ||
              (planNickname !== "Plus" && planNickname !== "Pro")
            ) {
              throw new Error(`Invalid plan nickname: ${planNickname}`);
            }

            await ctx.runMutation(internal.users.updateUserSubscription, {
              externalId: id,
              plan: planNickname,
            });
            console.log(
              `[Webhook] User ${id}'s subscription updated to ${planNickname}.`,
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
