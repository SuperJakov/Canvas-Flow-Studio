"use client";

import Link from "next/link";
import { X, Check, Sparkles, ArrowRight, Crown, Zap } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const plans = [
  {
    name: "Plus",
    description: "For regular users who need higher limits and more power.",
    gradientText: "from-cyan-400 via-blue-500 to-purple-600",
    cardGradient: "from-cyan-500/10 via-blue-500/10 to-purple-600/10",
    borderGradient: "from-cyan-500/50 via-blue-500/50 to-purple-600/50",
    buttonGradient:
      "from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500",
    glowColor: "cyan-500/30",
    icon: Zap,
    popular: true,
    features: [
      "50 Whiteboards",
      "50 Nodes per whiteboard",
      "100 Image & Text Generations/month",
      "Higher Image Quality",
      "Priority Support",
      "Access to Beta Features",
    ],
  },
  {
    name: "Pro",
    description:
      "For power users who need advanced features and maximum capacity.",
    gradientText: "from-purple-400 via-pink-500 to-orange-400",
    cardGradient: "from-purple-500/10 via-pink-500/10 to-orange-400/10",
    borderGradient: "from-purple-500/50 via-pink-500/50 to-orange-400/50",
    buttonGradient:
      "from-purple-500 via-pink-500 to-orange-400 hover:from-purple-400 hover:via-pink-400 hover:to-orange-300",
    glowColor: "purple-500/40",
    icon: Crown,
    popular: false,
    features: [
      "Unlimited* Whiteboards",
      "100 Nodes per whiteboard",
      "250 Image & Text Generations/month",
      "Highest Image Quality",
      "Workflow History & Versioning",
      "All features from Plus",
    ],
  },
];

interface UpgradeBannerProps {
  isOpen: boolean;
  onCloseAction: () => void;
  featureName: string;
}

export default function UpgradeBanner({
  isOpen,
  onCloseAction,
  featureName,
}: UpgradeBannerProps) {
  const userPlanInfo = useQuery(api.users.getCurrentUserPlanInfo);
  const userPlan = userPlanInfo?.plan ?? "Free";
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Clean full-screen overlay with proper scrolling */}
      <div
        className="animate-in fade-in fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900/90 px-4 py-4 backdrop-blur-sm duration-300"
        onClick={onCloseAction}
      >
        {/* Main content card with responsive sizing */}
        <div
          className="animate-in slide-in-from-bottom-4 relative my-4 min-h-0 w-full max-w-4xl duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Clean card container */}
          <div className="relative rounded-2xl border border-gray-700 bg-gray-800 p-4 shadow-xl md:p-8">
            {/* Close button with hover effect */}
            <button
              onClick={onCloseAction}
              aria-label="Close upgrade banner"
              className="absolute top-4 right-4 rounded-full bg-gray-800/50 p-2 text-gray-400 transition-all hover:scale-110 hover:bg-gray-700/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Clean header section */}
            <div className="mb-6 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700">
                <Sparkles className="h-6 w-6 text-purple-400" />
              </div>

              <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                Unlock{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {featureName}
                </span>
              </h2>

              <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300">
                You&apos;re currently on the{" "}
                <span className="font-medium text-white">{userPlan} plan</span>.
                Choose a plan below to get higher limits and access to premium
                features.
              </p>
            </div>

            {/* Compact plan comparison */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-xl border p-4 transition-all duration-300 hover:border-purple-500/50 ${
                      plan.popular
                        ? "border-purple-500/30 bg-gray-900"
                        : "border-gray-700 bg-gray-900/50"
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
                        <div className="rounded-full bg-purple-600 px-2 py-1 text-xs font-medium text-white">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="p-3">
                      {/* Compact plan header */}
                      <div className="mb-3 flex items-center">
                        <div className="mr-2 rounded-lg border border-gray-600 bg-gray-800 p-1.5">
                          <IconComponent className="h-4 w-4 text-gray-300" />
                        </div>
                        <div>
                          <h3
                            className={`bg-gradient-to-r text-xl font-bold ${plan.gradientText} bg-clip-text text-transparent`}
                          >
                            {plan.name}
                          </h3>
                        </div>
                      </div>

                      <p className="mb-4 text-sm leading-relaxed text-gray-300">
                        {plan.description}
                      </p>

                      {/* Compact features list */}
                      <ul className="mb-4 space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <div className="mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-green-500/30 bg-green-500/20">
                              <Check className="h-2.5 w-2.5 text-green-400" />
                            </div>
                            <span className="text-gray-200">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Compact CTA Button with animated gradient */}
                      <Link
                        href="/pricing"
                        className={`group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r px-4 py-2.5 font-medium text-white shadow-lg transition-shadow hover:shadow-xl ${plan.buttonGradient} text-sm`}
                      >
                        {/* Repeating shimmer sweep */}
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]"></div>

                        <span className="relative z-10 flex items-center">
                          Upgrade to {plan.name}
                          <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Flexible billing • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
