import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("Received Clerk webhook request");

    try {
      const event = await validateRequest(request);
      if (!event) {
        console.error("Failed to validate webhook request");
        return new Response("Error occurred", { status: 400 });
      }

      console.log(`Processing Clerk webhook event: ${event.type}`, {
        eventId: event.data.id,
        eventObject: event.data.object,
      });

      switch (event.type) {
        case "user.created":
          console.log(`User created: ${event.data.id}`);
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });

          console.log("Adding 20 image credits...");
          await ctx.scheduler.runAfter(0, internal.credits.addCredits, {
            userId: event.data.id,
            creditType: "image",
            creditAmount: 20,
            type: "signup",
          });
          console.log("Adding 3 speech credits...");
          await ctx.scheduler.runAfter(0, internal.credits.addCredits, {
            userId: event.data.id,
            creditType: "speech",
            creditAmount: 5,
            type: "signup",
          });
          console.log("Adding 15 website credits...");
          await ctx.scheduler.runAfter(0, internal.credits.addCredits, {
            userId: event.data.id,
            creditType: "website",
            creditAmount: 15,
            type: "signup",
          });

          await ctx.runMutation(internal.users.setLastCreditTopUp, {
            userId: event.data.id,
            timestamp: Date.now(),
          });
          break;

        case "user.updated":
          console.log(`User updated: ${event.data.id}`);
          await ctx.runMutation(internal.users.upsertFromClerk, {
            data: event.data,
          });
          break;

        case "user.deleted": {
          const clerkUserId = event.data.id!;
          console.log(`User deleted: ${clerkUserId}`);
          await ctx.runMutation(internal.users.deleteFromClerk, {
            clerkUserId,
          });
          break;
        }

        default:
          console.log("Ignored Clerk webhook event", {
            type: event.type,
            eventId: event.data.id,
            eventObject: event.data.object,
          });
      }

      console.log(`Successfully processed Clerk webhook event: ${event.type}`);
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error processing Clerk webhook:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payloadString, svixHeaders) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
}

// This is the public-facing endpoint that Stripe will call.
const handleStripeWebhook = httpAction(async (ctx, request) => {
  console.log("Received http actions /stripe");
  const signature = request.headers.get("stripe-signature")!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(
      "STRIPE_WEBHOOK_SECRET is not set in Convex environment variables.",
    );
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      await request.text(), // Raw request body
      signature,
      webhookSecret,
    );

    await ctx.scheduler.runAfter(0, internal.stripe.handleEvent, { event });

    // Acknowledge receipt of the event
    return new Response(null, { status: 200 });
  } catch (err: unknown) {
    console.error(
      "Error verifying Stripe webhook signature:",
      err instanceof Error ? err.message : String(err),
    );
    // Stripe expects a 400 response for signature-related errors.
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : String(err)}`,
      { status: 400 },
    );
  }
});

http.route({
  path: "/stripe",
  method: "POST",
  handler: handleStripeWebhook,
});

export default http;
