"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FC, // Import FC for typing functional components
} from "react";
import { useAtom } from "jotai";
import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import Image from "next/image";
import {
  Lock,
  LockOpen,
  Play,
  Square,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Download,
  ExternalLink,
  Upload,
} from "lucide-react";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { ImageNodeType } from "~/Types/nodes";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";
import Portal from "../Portal";
import { useParams } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  registerImageAction,
  unregisterImageAction,
} from "~/app/whiteboard/nodeActionRegistry";

// =================================================================
//  Presentational Components with Types
// =================================================================

type RateLimitWarningProps = {
  daysUntilReset: number;
  hoursUntilReset: number;
  onUpgradeClick: () => void;
};

/**
 * Displays a warning banner when the user has hit the image generation rate limit.
 */
const RateLimitWarning: FC<RateLimitWarningProps> = ({
  daysUntilReset,
  hoursUntilReset,
  onUpgradeClick,
}) => (
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

type NodeHeaderProps = {
  isLocked: boolean;
  isRunning: boolean;
  hasIncomingConnections: boolean;
  isRateLimited: boolean;
  onToggleLock: () => void;
  onToggleRun: () => void;
};

/**
 * Renders the header of the node, containing the title and action buttons.
 */
const NodeHeader: FC<NodeHeaderProps> = ({
  isLocked,
  isRunning,
  hasIncomingConnections,
  isRateLimited,
  onToggleLock,
  onToggleRun,
}) => {
  const canRun = hasIncomingConnections && !isRateLimited;
  const runButtonTitle = isRateLimited
    ? "Cannot run: rate limit reached"
    : hasIncomingConnections
      ? "Run node"
      : "Cannot run: no incoming text connection";

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <div className="flex items-center">
        <ImageIcon size={18} className="mx-1" />
        <span className="mr-2 font-medium text-black">Image</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
          onClick={onToggleLock}
          title="Toggle lock"
        >
          {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
        </button>
        <button
          className={`cursor-pointer rounded p-1 ${
            canRun
              ? "text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
              : "cursor-not-allowed text-gray-400"
          }`}
          onClick={onToggleRun}
          title={runButtonTitle}
          disabled={!canRun}
        >
          {isRunning ? (
            <Square size={18} />
          ) : canRun ? (
            <Play size={18} fill="currentColor" />
          ) : (
            <AlertCircle size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

type RunningIndicatorProps = {
  onUpgradeClick: () => void;
};

/**
 * Displays an indicator while the image is being generated.
 */
const RunningIndicator: FC<RunningIndicatorProps> = ({ onUpgradeClick }) => (
  <div className="flex flex-col items-center text-gray-400">
    <Loader2 size={48} className="animate-spin" />
    <p className="mt-2">Generating image...</p>
    <button
      type="button"
      onClick={onUpgradeClick}
      className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
    >
      <span>Upgrade for streaming images</span>
      <ExternalLink size={10} />
    </button>
  </div>
);

type ImagePlaceholderProps = {
  isUploading: boolean;
  isRateLimited: boolean;
  onUpload: () => void;
  onUpgradeClick: () => void;
};

/**
 * Displays the placeholder content for when no image is available.
 */
const ImagePlaceholder: FC<ImagePlaceholderProps> = ({
  isUploading,
  isRateLimited,
  onUpload,
  onUpgradeClick,
}) => (
  <div className="flex flex-col items-center text-gray-400">
    <button
      onClick={onUpload}
      className="mb-4 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-gray-600"
      title="Upload image"
      disabled={isUploading}
    >
      {isUploading ? (
        <Loader2 size={24} className="animate-spin" />
      ) : (
        <Upload size={24} />
      )}
    </button>
    <ImageIcon size={24} />
    <p className="mt-1 text-sm">No image generated yet</p>
    {!isRateLimited && (
      <button
        type="button"
        onClick={onUpgradeClick}
        className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
      >
        <span>Upgrade for higher quality</span>
        <ExternalLink size={10} />
      </button>
    )}
  </div>
);

type ImageWithControlsProps = {
  url: string;
  isImageLoading: boolean;
  isDownloading: boolean;
  isUploading: boolean;
  onDownload: () => void;
  onUpload: () => void;
  onImageLoad: () => void;
  onImageError: () => void;
};

/**
 * Displays the generated image along with download and upload controls.
 */
const ImageWithControls: FC<ImageWithControlsProps> = ({
  url,
  isImageLoading,
  isDownloading,
  isUploading,
  onDownload,
  onUpload,
  onImageLoad,
  onImageError,
}) => (
  <>
    {isImageLoading && (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-800">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 size={32} className="animate-spin" />
          <p className="mt-2 text-sm">Loading image...</p>
        </div>
      </div>
    )}
    <div className="relative h-full w-full">
      <Image
        src={url}
        alt="Generated"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        quality={75}
        onLoad={onImageLoad}
        onError={onImageError}
      />
    </div>
    <button
      onClick={onDownload}
      disabled={isDownloading}
      className="absolute top-3 right-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      title={isDownloading ? "Downloading..." : "Download image"}
    >
      {isDownloading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Download size={18} />
      )}
    </button>
    <button
      onClick={onUpload}
      className="absolute top-3 left-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-700"
      title="Upload image"
      disabled={isUploading}
    >
      {isUploading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Upload size={18} />
      )}
    </button>
  </>
);

type ImageContentProps = {
  isRunning: boolean;
  url: string | null | undefined;
  isImageLoading: boolean;
  isDownloading: boolean;
  isUploading: boolean;
  isRateLimited: boolean;
  onDownload: () => void;
  onUpload: () => void;
  onImageLoad: () => void;
  onImageError: () => void;
  openBanner: (feature: string) => void;
};

/**
 * Orchestrates the content area of the node, rendering the correct state.
 */
const ImageContent: FC<ImageContentProps> = ({
  isRunning,
  url,
  isImageLoading,
  isDownloading,
  isUploading,
  isRateLimited,
  onDownload,
  onUpload,
  onImageLoad,
  onImageError,
  openBanner,
}) => {
  if (isRunning) {
    return (
      <RunningIndicator onUpgradeClick={() => openBanner("Streaming Images")} />
    );
  }

  if (url) {
    return (
      <ImageWithControls
        url={url}
        isImageLoading={isImageLoading}
        isDownloading={isDownloading}
        isUploading={isUploading}
        onDownload={onDownload}
        onUpload={onUpload}
        onImageLoad={onImageLoad}
        onImageError={onImageError}
      />
    );
  }

  return (
    <ImagePlaceholder
      isUploading={isUploading}
      isRateLimited={isRateLimited}
      onUpload={onUpload}
      onUpgradeClick={() => openBanner("Higher Quality Images")}
    />
  );
};

// =================================================================
//  Main Node Component (Container)
// =================================================================

export default function ImageNode({
  id,
  data,
  selected,
}: NodeProps<ImageNodeType>) {
  // --- Hooks and State Management ---
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const generateAndStoreImageAction = useAction(
    api.imageNodes.generateAndStoreImage,
  );
  const uploadAndStoreImageAction = useAction(
    api.imageNodes.uploadAndStoreImage,
  );
  const url = useQuery(api.imageNodes.getImageNodeUrl, { nodeId: id });
  const imageGenRateLimit = useQuery(
    api.imageNodes.getImageGenerationRateLimit,
  );
  const edges = useEdges();
  const params = useParams();

  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Derived State and Data ---
  const isRateLimited = imageGenRateLimit ? !imageGenRateLimit.ok : false;
  const retryAfterSeconds = imageGenRateLimit?.retryAfter;
  const isLocked = data.isLocked ?? false;
  const isRunning = data.isRunning ?? false;
  const whiteboardId = params?.id as string | undefined;
  const hasIncomingConnections = edges.some((edge) => edge.target === id);
  const hoursUntilReset = retryAfterSeconds
    ? Math.ceil(retryAfterSeconds / 3600 / 1000)
    : 0;
  const daysUntilReset =
    hoursUntilReset > 24 ? Math.ceil(hoursUntilReset / 24) : 0;

  // --- Side Effects ---
  useLayoutEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "image",
      updatedData: { imageUrl: url ?? null, internal: { isRateLimited } },
    });
  }, [id, updateNodeData, url, isRateLimited]);

  useEffect(() => {
    registerImageAction(id, generateAndStoreImageAction);
    return () => unregisterImageAction(id);
  }, [id, generateAndStoreImageAction]);

  useEffect(() => {
    if (url) setIsImageLoading(true);
  }, [url]);

  // --- Event Handlers ---
  const openBanner = useCallback((feature: string) => {
    setBannerFeature(feature);
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => setIsBannerOpen(false), []);

  const toggleLock = useCallback(() => {
    updateNodeData({
      nodeId: id,
      updatedData: { isLocked: !isLocked },
      nodeType: "image",
    });
  }, [id, isLocked, updateNodeData]);

  const toggleRunning = useCallback(() => {
    if (isRunning) {
      updateNodeData({
        nodeId: id,
        updatedData: { isRunning: false },
        nodeType: "image",
      });
    } else if (hasIncomingConnections && !isRateLimited) {
      void executeNode({ nodeId: id });
    } else if (isRateLimited) {
      openBanner("Higher Rate Limits");
    }
  }, [
    id,
    isRunning,
    hasIncomingConnections,
    isRateLimited,
    updateNodeData,
    executeNode,
    openBanner,
  ]);

  const handleDownload = useCallback(async () => {
    if (!url || isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [url, id, isDownloading]);

  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !whiteboardId) return;
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        await uploadAndStoreImageAction({
          file: arrayBuffer,
          nodeId: id,
          whiteboardId: whiteboardId as Id<"whiteboards">,
        });
      } catch (err) {
        console.error("Failed to upload image:", err);
      } finally {
        setIsUploading(false);
      }
    },
    [id, uploadAndStoreImageAction, whiteboardId],
  );

  const handleImageLoad = useCallback(() => setIsImageLoading(false), []);
  const handleImageError = useCallback(() => setIsImageLoading(false), []);

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when image node was rendered",
    );
  }

  // --- Render ---
  return (
    <div className="relative">
      <Portal>
        <UpgradeBanner
          isOpen={isBannerOpen}
          onCloseAction={closeBanner}
          featureName={bannerFeature}
        />
      </Portal>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div
        className={`overflow-hidden rounded border-2 bg-purple-200 shadow-md ${isRateLimited ? "border-red-500" : selected ? "border-blue-500" : "border-white"}`}
      >
        {isRateLimited ? (
          <RateLimitWarning
            daysUntilReset={daysUntilReset}
            hoursUntilReset={hoursUntilReset}
            onUpgradeClick={() => openBanner("Higher Rate Limits")}
          />
        ) : (
          <NodeHeader
            isLocked={isLocked}
            isRunning={isRunning}
            hasIncomingConnections={hasIncomingConnections}
            isRateLimited={isRateLimited}
            onToggleLock={toggleLock}
            onToggleRun={toggleRunning}
          />
        )}
        <div className="bg-gray-800 p-2">
          <Handle type="target" position={Position.Top} />
          <div className="group relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
            <ImageContent
              isRunning={isRunning}
              url={url}
              isImageLoading={isImageLoading}
              isDownloading={isDownloading}
              isUploading={isUploading}
              isRateLimited={isRateLimited}
              onDownload={handleDownload}
              onUpload={handleUpload}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              openBanner={openBanner}
            />
          </div>
          <Handle type="source" position={Position.Bottom} />
        </div>
      </div>
    </div>
  );
}
