"use client";
import { useState } from "react";
import { useConvexAuth } from "convex/react";
import {
  Check,
  ArrowRight,
  Sparkles,
  X,
  Calendar,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Loading from "../loading";
import { SignUpButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useAction } from "convex/react";
import FAQ from "./FAQ";
import { FeatureSection } from "./components/FeatureSection";
import { SubscriptionStatus } from "./components/SubscriptionStatus";
import { plans, tierRanks } from "./data/plans";
import type { SubscriptionProperties } from "./types";
import { useConvexQuery } from "~/helpers/convex";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import CTASection from "../_components/homepage/CTASection";

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

export default function PricingPage() {
  const auth = useConvexAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const getCheckoutSessionUrl = useAction(api.stripe.getCheckoutSessionUrl);
  const getCustomerBillingPortalUrl = useAction(
    api.stripe.getCustomerBillingPortalUrl,
  );
  const cancelSubscription = useAction(api.stripe.cancelSubscription);
  const reactivateSubscription = useAction(api.stripe.reactivateSubscription);
  const planInfo = useConvexQuery(api.users.getCurrentUserPlanInfo);

  if (auth.isLoading || planInfo === undefined) {
    return <Loading />;
  }

  const currentTier = planInfo?.plan ?? "Free";

  const formatDate = (timestamp: number | bigint | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePlanChange = async (planName: string) => {
    if (!auth.isAuthenticated) return;
    setLoadingTier(planName === "Reactivate" ? currentTier : planName);

    try {
      if (planName === "Reactivate") {
        await reactivateSubscription();
      } else if (planName === "Free") {
        await cancelSubscription();
      } else {
        const url = await getCheckoutSessionUrl({
          tier: planName as "Plus" | "Pro",
        });
        if (url) {
          window.location.href = url;
        } else {
          console.error("Failed to get checkout session URL.");
          alert("Could not initiate plan change. Please try again later.");
        }
      }
    } catch (error) {
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
      const url = await getCustomerBillingPortalUrl({
        returnUrl: window.location.href,
      });
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error getting billing portal URL:", error);
      alert("Could not access billing portal. Please try again later.");
    }
  };

  const getButtonConfig = (plan: (typeof plans)[0]) => {
    const currentRank = tierRanks[currentTier] ?? 0;
    const planRank = tierRanks[plan.name] ?? 0;

    const isPendingCancellation =
      hasSubscriptionProperties(planInfo) && planInfo.cancel_at_period_end;

    if (isPendingCancellation) {
      if (plan.name === currentTier) {
        return {
          text: "Reactivate Plan",
          disabled: false,
          onClick: () => handlePlanChange("Reactivate"),
          className: `flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`,
        };
      }
      if (planRank < currentRank) {
        return {
          text: `Downgrade to ${plan.name}`,
          disabled: true,
          onClick: null,
          className:
            "flex w-full cursor-default items-center justify-center rounded-xl bg-gray-700/50 px-6 py-3.5 font-medium text-gray-400 shadow-lg opacity-60",
        };
      }
    }

    if (plan.name === currentTier) {
      if (plan.name === "Free") {
        return {
          text: "Current Plan",
          disabled: true,
          onClick: null,
          className:
            "flex w-full cursor-default items-center justify-center rounded-xl bg-gray-600 px-6 py-3.5 font-medium text-white shadow-lg",
        };
      } else {
        return {
          text: "Manage",
          disabled: false,
          onClick: handleManageSubscription,
          className: `flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`,
        };
      }
    }

    if (planRank > currentRank) {
      return {
        text: `Upgrade to ${plan.name}`,
        disabled: false,
        onClick: () => handlePlanChange(plan.name),
        className: `flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70`,
      };
    } else {
      return {
        text: `Downgrade to ${plan.name}`,
        disabled: false,
        onClick: () => handlePlanChange(plan.name),
        className: `flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70`,
      };
    }
  };

  const renderButton = (plan: (typeof plans)[0]) => {
    const buttonConfig = getButtonConfig(plan);
    const isLoading = loadingTier === plan.name;

    if (!auth.isAuthenticated) {
      if (plan.name === "Free") {
        return (
          <Button asChild size="lg" className="w-full">
            <Link
              href="/whiteboard"
              className="from-primary to-secondary text-primary-foreground bg-gradient-to-r shadow-lg hover:scale-[1.02] hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        );
      } else {
        return (
          <SignUpButton mode="modal">
            <Button
              size="lg"
              className={cn(
                "w-full",
                plan.popular
                  ? "from-primary to-secondary text-primary-foreground bg-gradient-to-r shadow-lg hover:scale-[1.02] hover:shadow-xl"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:scale-[1.02]",
              )}
            >
              Sign Up to Upgrade
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignUpButton>
        );
      }
    }

    // For authenticated users
    const getButtonVariant = () => {
      if (buttonConfig.disabled) return "outline";
      if (plan.popular) return "default";
      if (plan.name === currentTier) return "secondary";
      return "outline";
    };

    const getButtonClassName = () => {
      const baseClasses = "w-full";

      if (buttonConfig.disabled) {
        return cn(baseClasses, "opacity-50 cursor-not-allowed");
      }

      if (plan.popular) {
        return cn(
          baseClasses,
          "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:scale-[1.02] hover:shadow-xl",
        );
      }

      if (plan.name === currentTier) {
        return cn(
          baseClasses,
          "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:scale-[1.02] hover:shadow-xl",
        );
      }

      return cn(
        baseClasses,
        "bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 hover:scale-[1.02]",
      );
    };

    return (
      <Button
        onClick={buttonConfig.onClick ?? undefined}
        disabled={buttonConfig.disabled || isLoading}
        variant={getButtonVariant()}
        size="lg"
        className={getButtonClassName()}
      >
        {isLoading ? "Processing..." : buttonConfig.text}
        {!buttonConfig.disabled && !isLoading && (
          <ArrowRight className="ml-2 h-4 w-4" />
        )}
      </Button>
    );
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
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Pricing Plans
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl">
              Start free and scale as you grow. All plans include access to our
              powerful AI whiteboard.
            </p>
          </div>
        </section>
        {/* Subscription Status Banner */}
        {auth.isAuthenticated && subscriptionStatus && (
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
        {auth.isAuthenticated && planInfo && (
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
              <div
                key={plan.name}
                className={`group relative flex h-full flex-col rounded-3xl border p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl lg:p-8 ${
                  plan.popular
                    ? "bg-card ring-primary/30 hover:ring-primary/50 ring-2"
                    : "bg-card hover:ring-secondary/30 hover:ring-1"
                } ${
                  plan.name === currentTier
                    ? "to-card bg-gradient-to-b from-green-900/20 ring-2 ring-green-500/30"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <div className="from-primary to-secondary text-primary-foreground flex items-center rounded-full bg-gradient-to-r px-4 py-2 text-sm font-bold shadow-lg">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                {plan.name === currentTier && (
                  <div className="absolute -top-4 right-4">
                    <div className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <Check className="mr-1 h-3 w-3" />
                      Current
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-card-foreground text-2xl font-bold">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-8 pb-6">
                  <div className="flex items-end">
                    <span className="text-card-foreground text-5xl font-bold">
                      {plan.currency}
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      /{plan.period}
                    </span>
                  </div>
                </div>
                <div className="mb-8 flex flex-1 flex-col gap-y-6">
                  <FeatureSection
                    title="Account & Whiteboards"
                    features={plan.features.account}
                    color="blue"
                  />
                  <FeatureSection
                    title="Content Generation"
                    features={plan.features.content}
                    color="green"
                  />
                  <div className="flex flex-col">
                    <h4 className="text-muted-foreground mb-3 flex items-center text-sm font-semibold tracking-wider uppercase">
                      <span className="bg-primary mr-2 h-0.5 w-5"></span>
                      Premium Features
                    </h4>
                    <ul className="flex-1 space-y-3">
                      {plan.features.premium.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          {feature.included ? (
                            <Check className="mt-1 mr-3 h-5 w-5 flex-shrink-0 rounded-full bg-[var(--chart-3)]/20 p-1 text-[var(--chart-3)]" />
                          ) : (
                            <X className="bg-destructive/20 text-destructive mt-1 mr-3 h-5 w-5 flex-shrink-0 rounded-full p-1" />
                          )}
                          <span
                            className={`${feature.included ? "text-card-foreground" : "text-muted-foreground"}`}
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-auto pt-4">{renderButton(plan)}</div>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-8 text-center text-sm">
            *Unlimited access is subject to abuse guardrails.
          </div>
        </section>

        <FAQ />

        {!auth.isAuthenticated && <CTASection />}
      </div>
    </div>
  );
}
