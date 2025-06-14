"use client";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import {
  Check,
  ArrowRight,
  Sparkles,
  X,
  AlertTriangle,
  Calendar,
  CreditCard,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Loading from "../loading";
import { SignUpButton } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useAction } from "convex/react";

// Define types for FeatureSection props
interface FeatureItem {
  name: string;
  value: string;
}

interface FeatureSectionProps {
  title: string;
  features: FeatureItem[];
  color: "blue" | "green" | "yellow" | "purple";
}

// Define a type for the subscription properties
interface SubscriptionProperties {
  plan: "Plus" | "Pro";
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  canceled_at?: number;
}

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

// Define tier ranks for comparison logic
const tierRanks: Record<string, number> = {
  Free: 0,
  Plus: 1,
  Pro: 2,
};

const plans = [
  {
    name: "Free",
    price: "0",
    currency: "€",
    period: "forever",
    description: "Perfect for learning and experimenting with AI workflows",
    gradient: "from-gray-500 to-gray-600",
    borderGradient: "from-gray-600 to-gray-700",
    buttonStyle: "bg-gray-700 hover:bg-gray-600 text-white",
    popular: false,
    features: {
      account: [
        { name: "Whiteboards", value: "5" },
        { name: "Nodes per whiteboard", value: "10" },
      ],
      content: [
        { name: "Text Generation from Image", value: "10/month" },
        { name: "Image Generation", value: "10/month" },
        { name: "Image Quality", value: "Low" },
        { name: "Instruction Use", value: "20/month" },
        { name: "Speech Generation", value: "3/month" },
      ],
      integrations: [
        { name: "Weather Use", value: "1/month" },
        { name: "Website Generation", value: "1/month" },
      ],
      premium: [
        { name: "Workflow History & Versioning", included: false },
        { name: "Priority Support", included: false },
        { name: "Beta Features", included: false },
      ],
    },
  },
  {
    name: "Plus",
    price: "4",
    currency: "€",
    period: "month",
    description: "Increased limits and additional features for regular users",
    gradient: "from-blue-500 to-purple-600",
    borderGradient: "from-blue-500 to-purple-600",
    buttonStyle:
      "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white",
    popular: true,
    features: {
      account: [
        { name: "Whiteboards", value: "50" },
        { name: "Nodes per whiteboard", value: "50" },
      ],
      content: [
        { name: "Text Generation from Image", value: "100/month" },
        { name: "Image Generation", value: "100/month" },
        { name: "Image Quality", value: "Enhanced" },
        { name: "Instruction Use", value: "200/month" },
        { name: "Speech Generation", value: "35/month" },
      ],
      integrations: [
        { name: "Weather Use", value: "30/month" },
        { name: "Website Generation", value: "10/month" },
      ],
      premium: [
        { name: "Workflow History & Versioning", included: false },
        { name: "Priority Support", included: true },
        { name: "Beta Features", included: true },
      ],
    },
  },
  {
    name: "Pro",
    price: "10",
    currency: "€",
    period: "month",
    description: "Highest limits and full access to all premium features",
    gradient: "from-purple-500 to-pink-600",
    borderGradient: "from-purple-500 to-pink-600",
    buttonStyle:
      "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white",
    popular: false,
    features: {
      account: [
        { name: "Whiteboards", value: "Unlimited*" },
        { name: "Nodes per whiteboard", value: "100" },
      ],
      content: [
        { name: "Text Generation from Image", value: "250/month" },
        { name: "Image Generation", value: "250/month" },
        { name: "Image Quality", value: "Premium" },
        { name: "Instruction Use", value: "500/month" },
        { name: "Speech Generation", value: "100/month" },
      ],
      integrations: [
        { name: "Weather Use", value: "60/month" },
        { name: "Website Generation", value: "40/month" },
      ],
      premium: [
        { name: "Workflow History & Versioning", included: true },
        { name: "Priority Support", included: true },
        { name: "Beta Features", included: true },
      ],
    },
  },
];

export default function PricingPage() {
  const auth = useConvexAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const getCheckoutSessionUrl = useAction(api.stripe.getCheckoutSessionUrl);
  const getCustomerBillingPortalUrl = useAction(
    api.stripe.getCustomerBillingPortalUrl,
  );
  const cancelSubscription = useAction(api.stripe.cancelSubscription);
  const reactivateSubscription = useAction(api.stripe.reactivateSubscription);
  const planInfo = useQuery(api.users.getCurrentUserPlanInfo);

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

  const getSubscriptionStatus = () => {
    if (
      !planInfo ||
      planInfo.plan === "Free" ||
      !hasSubscriptionProperties(planInfo)
    ) {
      return null;
    }

    const { status, cancel_at_period_end, current_period_end, canceled_at } =
      planInfo;

    const isActive = status === "active";
    const isCanceled = cancel_at_period_end;
    const periodEndDate = current_period_end
      ? formatDate(current_period_end)
      : null;
    const canceledDate = canceled_at ? formatDate(canceled_at) : null;

    if (isCanceled && isActive) {
      return {
        type: "warning",
        message: `Your subscription is canceled and will end on ${periodEndDate}. You'll be downgraded to the Free plan.`,
        icon: <AlertTriangle className="h-5 w-5" />,
      };
    }

    if (status === "past_due") {
      return {
        type: "error",
        message:
          "Your subscription payment is past due. Please update your payment method.",
        icon: <CreditCard className="h-5 w-5" />,
      };
    }

    if (status === "canceled") {
      return {
        type: "info",
        message: `Your subscription was canceled${canceledDate ? ` on ${canceledDate}` : ""}. You're now on the Free plan.`,
        icon: <X className="h-5 w-5" />,
      };
    }

    if (isActive) {
      return {
        type: "success",
        message: `Your subscription is active${periodEndDate ? ` until ${periodEndDate}` : ""}.`,
        icon: <Check className="h-5 w-5" />,
      };
    }

    return {
      type: "info",
      message: `Subscription status: ${status}`,
      icon: <Clock className="h-5 w-5" />,
    };
  };

  const handlePlanChange = async (planName: string) => {
    if (!auth.isAuthenticated) return;
    setLoadingTier(planName === "Reactivate" ? currentTier : planName);

    try {
      if (planName === "Reactivate") {
        await reactivateSubscription();
        // Optionally show a success message
      } else if (planName === "Free") {
        await cancelSubscription();
      } else {
        // For upgrades or paid plan changes, use Stripe checkout
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

    // Check for pending cancellation state
    const isPendingCancellation =
      hasSubscriptionProperties(planInfo) && planInfo.cancel_at_period_end;

    if (isPendingCancellation) {
      // Logic for users who have already canceled
      if (plan.name === currentTier) {
        // Option to reverse the cancellation
        return {
          text: "Reactivate Plan",
          disabled: false,
          onClick: () => handlePlanChange("Reactivate"),
          className: `flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`,
        };
      }
      if (planRank < currentRank) {
        // Disable downgrade options
        return {
          text: `Downgrade to ${plan.name}`,
          disabled: true,
          onClick: null,
          className:
            "flex w-full cursor-default items-center justify-center rounded-xl bg-gray-700/50 px-6 py-3.5 font-medium text-gray-400 shadow-lg opacity-60",
        };
      }
    }

    // Current plan
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

    // Different plan
    if (planRank > currentRank) {
      // Upgrade
      return {
        text: `Upgrade to ${plan.name}`,
        disabled: false,
        onClick: () => handlePlanChange(plan.name),
        className: `flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${plan.buttonStyle} ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70`,
      };
    } else {
      // Downgrade
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

    // For unauthenticated users
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

    // For authenticated users
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

  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <section className="container mx-auto px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
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
              className={`rounded-xl border p-4 ${
                subscriptionStatus.type === "warning"
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : subscriptionStatus.type === "error"
                    ? "border-red-500/30 bg-red-500/10"
                    : subscriptionStatus.type === "success"
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-blue-500/30 bg-blue-500/10"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`mr-3 ${
                    subscriptionStatus.type === "warning"
                      ? "text-yellow-400"
                      : subscriptionStatus.type === "error"
                        ? "text-red-400"
                        : subscriptionStatus.type === "success"
                          ? "text-green-400"
                          : "text-blue-400"
                  }`}
                >
                  {subscriptionStatus.icon}
                </div>
                <p
                  className={`text-sm font-medium ${
                    subscriptionStatus.type === "warning"
                      ? "text-yellow-300"
                      : subscriptionStatus.type === "error"
                        ? "text-red-300"
                        : subscriptionStatus.type === "success"
                          ? "text-green-300"
                          : "text-blue-300"
                  }`}
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
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Current Plan: {currentTier}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                      {planInfo.cancel_at_period_end && (
                        <div className="flex items-center">
                          <div className="mr-3 rounded-full bg-yellow-500/20 p-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Auto-renewal
                            </p>
                            <p className="font-medium text-white">Canceled</p>
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`group relative flex h-full flex-col rounded-3xl border border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl ${
                plan.popular
                  ? "ring-2 ring-blue-500/30 hover:ring-blue-500/50"
                  : "hover:ring-1 hover:ring-purple-500/30"
              } ${
                plan.name === currentTier
                  ? "bg-gradient-to-b from-green-900/20 to-gray-900/50 ring-2 ring-green-500/30"
                  : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {plan.name === currentTier && (
                <div className="absolute -top-4 right-4">
                  <div className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    <Check className="mr-1 h-3 w-3" />
                    Current
                  </div>
                </div>
              )}

              {/* Card Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-gray-400">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="mb-8 border-b border-gray-700/50 pb-6">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-5xl font-bold text-white">
                      {plan.currency}
                      {plan.price}
                    </span>
                    <span className="ml-2 text-gray-400">/{plan.period}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8 grid flex-1 grid-cols-1 gap-5">
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

                <FeatureSection
                  title="Integrations"
                  features={plan.features.integrations}
                  color="yellow"
                />

                <div className="flex flex-col">
                  <h4 className="mb-3 flex items-center text-sm font-semibold tracking-wider text-gray-400 uppercase">
                    <span className="mr-2 h-0.5 w-5 bg-purple-500"></span>
                    Premium Features
                  </h4>
                  <ul className="flex-1 space-y-3">
                    {plan.features.premium.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        {feature.included ? (
                          <Check className="mr-3 h-5 w-5 rounded-full bg-green-500/20 p-1 text-green-400" />
                        ) : (
                          <X className="mr-3 h-5 w-5 rounded-full bg-red-500/20 p-1 text-red-400" />
                        )}
                        <span
                          className={
                            feature.included ? "text-white" : "text-gray-500"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-auto">{renderButton(plan)}</div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          *Unlimited access is subject to abuse guardrails.
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="mt-3 text-gray-400">Everything you need to know</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                question: "What's included in the Free tier?",
                answer:
                  "The Free tier includes access to all core features with limits on whiteboards (5), nodes per whiteboard (10), and monthly AI operations. It's perfect for learning and experimenting.",
              },
              {
                question: "How do Plus and Pro tiers differ from Free?",
                answer:
                  "Plus and Pro offer increased limits on whiteboards, nodes, and AI operations. Plus includes priority support and beta features, while Pro adds workflow history, versioning, and unlimited* whiteboards.",
              },
              {
                question: "What AI models are available?",
                answer: "To know more about this, read the docs.",
              },
              {
                question: "How do rate limits work?",
                answer:
                  "Each subscription tier has monthly limits for operations like image generation, text analysis, and API integrations. Unused operations don't carry over to the next month. ",
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer:
                  "Yes, you can change plans at any time. Upgrades take effect immediately, while downgrades apply at your next billing cycle.",
              },
              {
                question: "How is billing handled?",
                answer:
                  "We use Stripe for secure payment processing. All paid plans are subscription-based with automatic monthly billing. You can cancel anytime on this page.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 transition-all hover:bg-gray-800/50"
              >
                <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
                  <span className="mr-3 h-2 w-2 rounded-full bg-purple-500"></span>
                  {faq.question}
                </h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              <div className="flex flex-col gap-4 sm:flex-row">
                <SignUpButton mode="modal">
                  <span className="flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3.5 font-medium text-white shadow-lg transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-xl">
                    Start Building for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </SignUpButton>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Feature section component with consistent heights
function FeatureSection({ title, features, color }: FeatureSectionProps) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="flex flex-col">
      <h4 className="mb-3 flex items-center text-sm font-semibold tracking-wider text-gray-400 uppercase">
        <span className={`mr-2 h-0.5 w-5 ${colorClasses[color]}`}></span>
        {title}
      </h4>
      <ul className="flex-1 space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <span className="text-gray-300">{feature.name}</span>
            <span className="font-medium text-white">{feature.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
