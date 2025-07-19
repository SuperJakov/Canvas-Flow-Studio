"use client";

import Link from "next/link";
import {
  X,
  Check,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useConvexQuery } from "~/helpers/convex";

const plans = [
  {
    name: "Plus",
    description: "For regular users who need higher limits and more power.",
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
  const userPlanInfo = useConvexQuery(api.users.getCurrentUserPlanInfo);
  const userPlan = userPlanInfo?.plan ?? "Free";
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Clean full-screen overlay with proper scrolling */}
      <div
        className="animate-in fade-in bg-background/90 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-4 backdrop-blur-sm duration-300"
        onClick={onCloseAction}
      >
        {/* Main content card with responsive sizing */}
        <div
          className="animate-in slide-in-from-bottom-4 relative w-full max-w-4xl duration-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Clean card container */}
          <div className="bg-card relative rounded-2xl border p-4 shadow-xl md:p-8">
            {/* Close button with hover effect */}
            <button
              onClick={onCloseAction}
              aria-label="Close upgrade banner"
              className="bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground absolute top-4 right-4 rounded-full p-2 transition-all hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Clean header section */}
            <div className="mb-6 text-center">
              <div className="bg-muted mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                <Sparkles className="text-primary h-6 w-6" />
              </div>

              <h2 className="text-foreground mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
                Unlock <span className="text-primary">{featureName}</span>
              </h2>

              <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
                You&apos;re currently on the{" "}
                <span className="text-foreground font-medium">
                  {userPlan} plan
                </span>
                . Choose a plan below to get higher limits and access to premium
                features.
              </p>
            </div>

            {/* Compact plan comparison */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                const isPlusCard = index === 0;
                const isCurrentPlan = userPlan === plan.name;
                const isDowngrade = userPlan === "Pro" && plan.name === "Plus";

                return (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-xl border p-4 transition-all duration-300 ${
                      plan.popular && !isCurrentPlan
                        ? "border-primary/30 bg-card hover:border-primary/50"
                        : isCurrentPlan
                          ? "bg-card border-[var(--chart-3)]/50"
                          : "bg-card/50 hover:border-accent/50 border"
                    }`}
                  >
                    {/* Current plan badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
                        <div className="text-primary-foreground flex items-center gap-1 rounded-full bg-[var(--chart-3)] px-2 py-1 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Current Plan
                        </div>
                      </div>
                    )}

                    {/* Popular badge - only show if not current plan */}
                    {plan.popular && !isCurrentPlan && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
                        <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-medium">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="p-3">
                      {/* Compact plan header */}
                      <div className="mb-3 flex items-center">
                        <div className="bg-muted mr-2 rounded-lg border p-1.5">
                          <IconComponent
                            className={`h-4 w-4 ${isPlusCard ? "text-accent" : "text-primary"}`}
                          />
                        </div>
                        <div>
                          <h3
                            className={`text-xl font-bold ${
                              isPlusCard ? "text-accent" : "text-primary"
                            }`}
                          >
                            {plan.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                        {plan.description}
                      </p>

                      {/* Compact features list */}
                      <ul className="mb-4 space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <div className="mr-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chart-3)]/30 bg-[var(--chart-3)]/20">
                              <Check className="h-2.5 w-2.5 text-[var(--chart-3)]" />
                            </div>
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      {isCurrentPlan ? (
                        <button
                          disabled
                          className="bg-muted text-muted-foreground flex w-full cursor-not-allowed items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium"
                        >
                          Current Plan
                        </button>
                      ) : (
                        <Link
                          href="/pricing"
                          className={`group relative flex w-full items-center justify-center overflow-hidden rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg transition-all hover:shadow-xl ${
                            isDowngrade
                              ? "bg-destructive text-destructive-foreground hover:opacity-90"
                              : isPlusCard
                                ? "bg-accent text-accent-foreground hover:opacity-90"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
                        >
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                          <span className="relative z-10 flex items-center">
                            {isDowngrade ? "Downgrade" : "Upgrade"} to{" "}
                            {plan.name}
                            <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact footer */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Flexible billing • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
