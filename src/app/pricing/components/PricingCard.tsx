"use client";

import { Check, ArrowRight, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { type plans, tierRanks } from "../data/plans";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { FeatureSection } from "./FeatureSection";
import posthog from "posthog-js";

type Plan = (typeof plans)[0];

interface PricingCardProps {
  plan: Plan;
  currentTier: string | null;
  isAuthenticated: boolean;
  isPendingCancellation: boolean;
  loadingTier: string | null;
  onPlanChange: (planName: string) => void;
  onManageSubscription: () => void;
}

export function PricingCard({
  plan,
  currentTier,
  isAuthenticated,
  isPendingCancellation,
  loadingTier,
  onPlanChange,
  onManageSubscription,
}: PricingCardProps) {
  const currentRank = tierRanks[currentTier ?? ""] ?? 0;
  const planRank = tierRanks[plan.name] ?? 0;
  const isCurrentPlan = plan.name === currentTier;

  const renderButton = () => {
    const isLoading = loadingTier === plan.name;

    if (!isAuthenticated) {
      if (plan.name === "Free") {
        return (
          <Button asChild size="lg" className="w-full">
            <Link
              href="/whiteboard"
              className="from-primary to-secondary text-primary-foreground bg-gradient-to-r shadow-lg hover:scale-[1.02] hover:shadow-xl"
              onClick={() => posthog.capture("get_started_free_click")}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        );
      }
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
            onClick={() =>
              posthog.capture("sign_up_to_upgrade_click", { plan: plan.name })
            }
          >
            Sign Up to Upgrade
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </SignUpButton>
      );
    }

    // Authenticated user logic
    let buttonText = "";
    let buttonOnClick: (() => void) | undefined = undefined;
    let buttonDisabled = false;

    if (isPendingCancellation) {
      if (isCurrentPlan) {
        buttonText = "Reactivate Plan";
        buttonOnClick = () => onPlanChange("Reactivate");
      } else if (planRank < currentRank) {
        buttonText = `Downgrade to ${plan.name}`;
        buttonDisabled = true;
      } else {
        buttonText = `Upgrade to ${plan.name}`;
        buttonOnClick = () => onPlanChange(plan.name);
      }
    } else if (isCurrentPlan) {
      if (plan.name === "Free") {
        buttonText = "Current Plan";
        buttonDisabled = true;
      } else {
        buttonText = "Manage";
        buttonOnClick = onManageSubscription;
      }
    } else {
      buttonText = `${planRank > currentRank ? "Upgrade" : "Downgrade"} to ${plan.name}`;
      buttonOnClick = () => onPlanChange(plan.name);
    }

    const getButtonClassName = () => {
      const baseClasses = "w-full";

      if (buttonDisabled) {
        return cn(baseClasses, "opacity-50 cursor-not-allowed");
      }

      if (plan.popular) {
        return cn(
          baseClasses,
          "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:scale-[1.02] hover:shadow-xl",
        );
      }

      if (isCurrentPlan) {
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
        onClick={buttonOnClick}
        disabled={buttonDisabled || isLoading}
        size="lg"
        className={getButtonClassName()}
      >
        {isLoading ? "Processing..." : buttonText}
        {!buttonDisabled && !isLoading && (
          <ArrowRight className="ml-2 h-4 w-4" />
        )}
      </Button>
    );
  };

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-3xl border p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl lg:p-8",
        plan.popular && "bg-card ring-primary/30 hover:ring-primary/50 ring-2",
        !plan.popular && "bg-card hover:ring-secondary/30 hover:ring-1",
        isCurrentPlan &&
          "to-card bg-gradient-to-b from-green-900/20 ring-2 ring-green-500/30",
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
          <div className="from-primary to-secondary text-primary-foreground flex items-center rounded-full bg-gradient-to-r px-4 py-2 text-sm font-bold shadow-lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Most Popular
          </div>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <div className="flex items-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
            <Check className="mr-1 h-3 w-3" />
            Current
          </div>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-card-foreground text-2xl font-bold">{plan.name}</h3>
        <p className="text-muted-foreground mt-2 text-sm">{plan.description}</p>
      </div>
      <div className="mb-8 pb-6">
        <div className="flex items-end">
          <span className="text-card-foreground text-5xl font-bold">
            {plan.currency}
            {plan.price}
          </span>
          <span className="text-muted-foreground ml-2">/{plan.period}</span>
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
      <div className="mt-auto pt-4">{renderButton()}</div>
    </div>
  );
}
