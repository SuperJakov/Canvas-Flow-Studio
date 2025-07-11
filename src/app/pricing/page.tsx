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
          <Link
            href="/whiteboard"
            className={`flex w-full items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        );
      } else {
        return (
          <SignUpButton mode="modal">
            <span className={buttonConfig.className}>
              Sign Up to Upgrade
              <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          </SignUpButton>
        );
      }
    }

    return (
      <button
        onClick={buttonConfig.onClick ?? undefined}
        disabled={buttonConfig.disabled || isLoading}
        className={buttonConfig.className}
      >
        {isLoading ? "Processing..." : buttonConfig.text}
        {!buttonConfig.disabled && !isLoading && (
          <ArrowRight className="ml-2 h-4 w-4" />
        )}
      </button>
    );
  };

  const subscriptionStatus = hasSubscriptionProperties(planInfo)
    ? SubscriptionStatus({ planInfo })
    : null;

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900/90">
        {/* Header */}
        <section className="container mx-auto px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Pricing Plans
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-300 sm:text-xl">
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
                className={`rounded-xl border border-green-500/30 bg-green-500/10 p-4`}
              >
                <div className="flex items-center">
                  <div className={`mr-3 text-green-400`}>
                    {subscriptionStatus.icon}
                  </div>
                  <p className={`text-sm font-medium text-green-300`}>
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
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Current Plan: {currentTier}
                </h3>
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
              </div>
            </div>
          </section>
        )}

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`group relative flex h-full flex-col rounded-3xl border border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl lg:p-8 ${
                  plan.popular
                    ? "ring-2 ring-blue-500/30 hover:ring-blue-500/50"
                    : "hover:ring-1 hover:ring-purple-500/30"
                } ${
                  plan.name === currentTier
                    ? "bg-gradient-to-b from-green-900/20 to-gray-900/50 ring-2 ring-green-500/30"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                    <div className="flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
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
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-8 border-b border-gray-700/50 pb-6">
                  <div className="flex items-end">
                    <span className="text-5xl font-bold text-white">
                      {plan.currency}
                      {plan.price}
                    </span>
                    <span className="ml-2 text-gray-400">/{plan.period}</span>
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
                    <h4 className="mb-3 flex items-center text-sm font-semibold tracking-wider text-gray-400 uppercase">
                      <span className="mr-2 h-0.5 w-5 bg-purple-500"></span>
                      Premium Features
                    </h4>
                    <ul className="flex-1 space-y-3">
                      {plan.features.premium.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          {feature.included ? (
                            <Check className="mt-1 mr-3 h-5 w-5 flex-shrink-0 rounded-full bg-green-500/20 p-1 text-green-400" />
                          ) : (
                            <X className="mt-1 mr-3 h-5 w-5 flex-shrink-0 rounded-full bg-red-500/20 p-1 text-red-400" />
                          )}
                          <span
                            className={`${feature.included ? "text-white" : "text-gray-500"}`}
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
          <div className="mt-8 text-center text-sm text-gray-400">
            *Unlimited access is subject to abuse guardrails.
          </div>
        </section>

        <FAQ />

        {!auth.isAuthenticated && (
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl rounded-3xl border border-purple-500/30 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 p-10 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white">
                  Ready to Build Powerful AI Workflows?
                </h2>
                <p className="mb-8 max-w-2xl text-xl text-gray-300">
                  Start with our generous free tier and upgrade when you&apos;re
                  ready to scale.
                </p>
                <SignUpButton>
                  <span className="flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3.5 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl">
                    Start Building for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </SignUpButton>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
