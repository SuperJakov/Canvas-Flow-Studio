"use client";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { Check, ArrowRight, Sparkles, X } from "lucide-react";
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
        { name: "Whiteboards", value: "Unlimited" },
        { name: "Nodes per whiteboard", value: "100" },
      ],
      content: [
        { name: "Text Generation from Image", value: "250/month" },
        { name: "Image Generation", value: "250/month" },
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
  const currentTier = useQuery(api.users.getCurrentUserPlan);

  if (auth.isLoading || !currentTier) {
    return <Loading />;
  }

  const handleUpgrade = async (tier: "Plus" | "Pro") => {
    if (!auth.isAuthenticated) return;
    setLoadingTier(tier);
    try {
      const url = await getCheckoutSessionUrl({ tier });
      if (url) {
        window.location.href = url;
      } else {
        console.error("Failed to get checkout session URL.");
        alert("Could not initiate upgrade. Please try again later.");
      }
    } catch (error) {
      console.error("Error during upgrade process:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Please try again."
        }`,
      );
    } finally {
      setLoadingTier(null);
    }
  };

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

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const isUpgrade =
              tierRanks[plan.name] ?? 0 > (tierRanks[currentTier] ?? 0);

            return (
              <div
                key={plan.name}
                className={`group relative flex h-full flex-col rounded-3xl border border-gray-700/50 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl ${
                  plan.popular
                    ? "ring-2 ring-blue-500/30 hover:ring-blue-500/50"
                    : "hover:ring-1 hover:ring-purple-500/30"
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

                {/* Card Header - Simplified without icon */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {plan.description}
                  </p>
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

                {/* Features - Consistent Heights */}
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
                <div className="mt-auto">
                  {plan.name === currentTier ? (
                    auth.isAuthenticated ? (
                      <button
                        onClick={async () => {
                          try {
                            const url = await getCustomerBillingPortalUrl({
                              returnUrl: window.location.href,
                            });
                            if (url) {
                              window.location.href = url;
                            }
                          } catch (error) {
                            console.error(
                              "Error getting billing portal URL:",
                              error,
                            );
                            alert(
                              "Could not access billing portal. Please try again later.",
                            );
                          }
                        }}
                        className={`flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${
                          plan.buttonStyle
                        } ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`}
                      >
                        Manage Subscription
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    ) : (
                      <Link
                        href="/whiteboard"
                        className={`flex w-full items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${
                          plan.buttonStyle
                        } ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`}
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    )
                  ) : isUpgrade ? (
                    auth.isAuthenticated ? (
                      <button
                        onClick={() =>
                          handleUpgrade(plan.name as "Plus" | "Pro")
                        }
                        disabled={loadingTier === plan.name}
                        className={`flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${
                          plan.buttonStyle
                        } ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70`}
                      >
                        {loadingTier === plan.name
                          ? "Redirecting..."
                          : `Upgrade to ${plan.name}`}
                        {loadingTier !== plan.name && (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <SignUpButton mode="modal">
                        <span
                          className={`flex w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3.5 font-medium shadow-lg transition-all ${
                            plan.buttonStyle
                          } ${plan.popular ? "shadow-blue-500/20" : "shadow-gray-900/20"} hover:scale-[1.02]`}
                        >
                          Sign Up to Upgrade
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      </SignUpButton>
                    )
                  ) : (
                    <button
                      disabled
                      className="flex w-full cursor-default items-center justify-center rounded-xl bg-gray-600 px-6 py-3.5 font-medium text-white shadow-lg"
                    >
                      Current Plan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
                  "Plus and Pro offer increased limits on whiteboards, nodes, and AI operations. Plus includes priority support and beta features, while Pro adds workflow history, versioning, and unlimited whiteboards.",
              },
              {
                question: "What AI models are available?",
                answer:
                  "We support Gemini 2.0 Flash for text, image generation models including Gemini 2.0 Flash Image Gen, and Google Cloud TTS for speech. More models are being added regularly.",
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
                  "We use Stripe for secure payment processing. All paid plans are subscription-based with automatic monthly billing. You can cancel anytime.",
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
