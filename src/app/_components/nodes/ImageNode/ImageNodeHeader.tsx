import {
  Lock,
  LockOpen,
  Play,
  Square,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { PopoverTrigger } from "~/components/ui/popover";
import { IMAGE_STYLES } from "./constants";

interface ImageNodeHeaderProps {
  isLocked: boolean;
  isRunning: boolean;
  hasIncomingConnections: boolean;
  isRateLimited: boolean;
  selectedStyle?: string;
  onToggleLock: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onToggleRunning: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onStylePopoverTrigger: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}

export function ImageNodeHeader({
  isLocked,
  isRunning,
  hasIncomingConnections,
  isRateLimited,
  selectedStyle,
  onToggleLock,
  onToggleRunning,
  onStylePopoverTrigger,
}: ImageNodeHeaderProps) {
  const currentStyle =
    IMAGE_STYLES.find((s) => s.id === selectedStyle) ?? IMAGE_STYLES[0];
  const CurrentIcon = currentStyle.icon;

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <div className="flex items-center text-black">
        <ImageIcon size={18} className="mx-1" />
        <span className="mr-2 font-medium">Image</span>
        <PopoverTrigger asChild>
          <button
            className="cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
            onClick={onStylePopoverTrigger}
          >
            <CurrentIcon size={18} />
          </button>
        </PopoverTrigger>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
          onClick={onToggleLock}
        >
          {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
        </button>
        <button
          className={`cursor-pointer rounded p-1 ${
            hasIncomingConnections && !isRateLimited
              ? "text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
              : "cursor-not-allowed text-gray-400"
          }`}
          onClick={onToggleRunning}
          title={
            isRateLimited
              ? "Cannot run: rate limit reached"
              : hasIncomingConnections
                ? "Run node"
                : "Cannot run: no incoming text connection"
          }
          disabled={!hasIncomingConnections || isRateLimited}
        >
          {isRunning ? (
            <Square size={18} />
          ) : hasIncomingConnections && !isRateLimited ? (
            <Play size={18} fill="currentColor" />
          ) : (
            <AlertCircle size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
