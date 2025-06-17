import { AlertTriangle, CreditCard, X, Check, Clock } from "lucide-react";
import type { SubscriptionProperties } from "../types";

interface SubscriptionStatusProps {
  planInfo: SubscriptionProperties | null;
}

export function SubscriptionStatus({ planInfo }: SubscriptionStatusProps) {
  if (!planInfo) return null;

  const formatDate = (timestamp: number | bigint | undefined | null) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
}
