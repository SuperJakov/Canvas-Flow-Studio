"use client";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { Calendar, CreditCard } from "lucide-react";
import Loading from "../loading";
import { api } from "../../../convex/_generated/api";
import { useAction } from "convex/react";
import FAQ from "./FAQ";
import { SubscriptionStatus } from "./components/SubscriptionStatus";
import { plans } from "./data/plans";
import type { SubscriptionProperties } from "./types";
import { useConvexQuery } from "~/helpers/convex";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import posthog from "posthog-js";
import Footer from "../_components/homepage/Footer";
import { PricingCard } from "./components/PricingCard";

// Type guard to check if planInfo has subscription properties
function hasSubscriptionProperties(
  planInfo: unknown,
): planInfo is SubscriptionProperties {
  return (
    typeof planInfo === "object" &&
    planInfo !== null &&
    "status" in planInfo &&
    "plan" in planInfo &&
    (planInfo.plan === "Plus" || planInfo.plan === "Pro")
  );
}

export default function PricingPageClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const getCheckoutSessionUrl = useAction(api.stripe.getCheckoutSessionUrl);
  const getCustomerBillingPortalUrl = useAction(
    api.stripe.getCustomerBillingPortalUrl,
  );
  const cancelSubscription = useAction(api.stripe.cancelSubscription);
  const reactivateSubscription = useAction(api.stripe.reactivateSubscription);
  const planInfo = useConvexQuery(api.users.getCurrentUserPlanInfo);
  const [showDisabledDialog, setShowDisabledDialog] = useState(false);

  if (isLoading || planInfo === undefined) {
    return <Loading />;
  }

  const currentTier = isAuthenticated ? (planInfo?.plan ?? "Free") : null;
  const isPendingCancellation =
    hasSubscriptionProperties(planInfo) && planInfo.cancel_at_period_end;

  const formatDate = (timestamp: number | bigint | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePlanChange = async (planName: string) => {
    if (!isAuthenticated) return;
    if (process.env.NEXT_PUBLIC_IS_STRIPE_DISABLED === "true") {
      posthog.capture("subscription_disabled_click");
      return setShowDisabledDialog(true);
    }
    setLoadingTier(planName === "Reactivate" ? currentTier : planName);

    try {
      if (planName === "Reactivate") {
        posthog.capture("subscription_reactivate_click");
        await reactivateSubscription();
      } else if (planName === "Free") {
        posthog.capture("subscription_cancel_click");
        await cancelSubscription();
      } else {
        posthog.capture("subscription_upgrade_click", { plan: planName });
        const url = await getCheckoutSessionUrl({
          tier: planName as "Plus" | "Pro",
        });
        if (url) {
          posthog.capture("subscription_checkout_redirect", { plan: planName });
          window.location.href = url;
        } else {
          posthog.capture("subscription_checkout_error", { plan: planName });
          console.error("Failed to get checkout session URL.");
          alert("Could not initiate plan change. Please try again later.");
        }
      }
    } catch (error) {
      posthog.capture("subscription_error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error("Error during plan change process:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Please try again."
        }`,
      );
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      posthog.capture("manage_subscription_click");
      const url = await getCustomerBillingPortalUrl({
        returnUrl: window.location.href,
      });
      if (url) {
        posthog.capture("billing_portal_redirect");
        window.location.href = url;
      }
    } catch (error) {
      posthog.capture("billing_portal_error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error("Error getting billing portal URL:", error);
      alert("Could not access billing portal. Please try again later.");
    }
  };

  const subscriptionStatus = hasSubscriptionProperties(planInfo)
    ? SubscriptionStatus({ planInfo })
    : null;

  return (
    <div className="bg-background text-foreground min-h-screen w-full">
      <div className="min-h-screen">
        {/* Header */}
        <section className="container mx-auto px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl">
              <span className="text-primary">Pricing Plans</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl">
              Start free and scale as you grow. All plans include access to our
              powerful AI whiteboard.
            </p>
          </div>
        </section>
        {/* Subscription Status Banner */}
        {isAuthenticated && subscriptionStatus && (
          <section className="container mx-auto px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div
                className="rounded-xl border p-4"
                style={{
                  borderColor: "hsl(var(--accent) / 0.3)",
                  backgroundColor: "hsl(var(--accent) / 0.1)",
                }}
              >
                <div className="flex items-center">
                  <div className="mr-3" style={{ color: "hsl(var(--accent))" }}>
                    {subscriptionStatus.icon}
                  </div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "hsl(var(--accent-foreground))" }}
                  >
                    {subscriptionStatus.message}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* Current Plan Info */}
        {isAuthenticated && planInfo && (
          <section className="container mx-auto px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Current Plan: {currentTier}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    {planInfo.plan !== "Free" &&
                      hasSubscriptionProperties(planInfo) && (
                        <>
                          <div className="flex items-center">
                            <div className="mr-3 rounded-full bg-blue-500/20 p-2">
                              <CreditCard className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-400">Status</p>
                              <p className="font-medium text-white capitalize">
                                {planInfo.status}
                              </p>
                            </div>
                          </div>
                          {planInfo.current_period_end && (
                            <div className="flex items-center">
                              <div className="mr-3 rounded-full bg-purple-500/20 p-2">
                                <Calendar className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">
                                  {planInfo.cancel_at_period_end
                                    ? "Ends"
                                    : "Renews"}
                                </p>
                                <p className="font-medium text-white">
                                  {formatDate(planInfo.current_period_end)}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Pricing cards */}
        <section className="container mx-auto px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-6 lg:gap-8">
            {plans.map((plan) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                currentTier={currentTier}
                isAuthenticated={isAuthenticated}
                isPendingCancellation={isPendingCancellation}
                loadingTier={loadingTier}
                onPlanChange={handlePlanChange}
                onManageSubscription={handleManageSubscription}
              />
            ))}
          </div>
          <div className="text-muted-foreground mt-8 text-center text-sm">
            *Unlimited access is subject to abuse guardrails.
          </div>
        </section>

        <FAQ />

        <Footer />
      </div>
      <Dialog open={showDisabledDialog} onOpenChange={setShowDisabledDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscriptions Disabled</DialogTitle>
            <DialogDescription>
              We are not accepting new subscriptions at this time. Please check
              back later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowDisabledDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
