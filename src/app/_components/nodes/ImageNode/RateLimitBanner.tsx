import { AlertCircle, ExternalLink } from "lucide-react";

interface RateLimitBannerProps {
  hoursUntilReset: number;
  daysUntilReset: number;
  onUpgradeClick: () => void;
}

export function RateLimitBanner({
  hoursUntilReset,
  daysUntilReset,
  onUpgradeClick,
}: RateLimitBannerProps) {
  return (
    <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-500">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <AlertCircle size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              Rate Limit Reached
            </span>
            <span className="text-xs text-red-100">
              Resets in{" "}
              {daysUntilReset > 0
                ? `${daysUntilReset} day${daysUntilReset > 1 ? "s" : ""}`
                : `${hoursUntilReset} hour${hoursUntilReset !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgradeClick}
          className="group flex cursor-pointer items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-xl"
        >
          <span>Upgrade</span>
          <ExternalLink
            size={10}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
}
