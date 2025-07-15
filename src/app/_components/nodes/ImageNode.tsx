"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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
  Wand2,
  Tv2,
  Grid,
  CircuitBoard,
  Box,
  Gem,
  PenTool,
  Paintbrush2,
  Shapes,
  Eye,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { ImageNodeType } from "~/Types/nodes";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";
import Portal from "../Portal";
import { useParams } from "next/navigation";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  registerImageAction,
  unregisterImageAction,
} from "~/app/whiteboard/nodeActionRegistry";
import { useConvexQuery } from "~/helpers/convex";

const IMAGE_STYLES = [
  { name: "Auto", icon: Wand2, id: "auto", imageUrl: "/auto_cat.png" },
  { name: "Anime", icon: Tv2, id: "anime", imageUrl: "/anime_cat.png" },
  {
    name: "Pixel Art",
    icon: Grid,
    id: "pixel-art",
    imageUrl: "/pixelart_cat.png",
  },
  {
    name: "Cyberpunk",
    icon: CircuitBoard,
    id: "cyberpunk",
    imageUrl: "/cyberpunk_cat.png",
  },
  {
    name: "3D Model",
    icon: Box,
    id: "3d-model",
    imageUrl: "/3d_cat.png",
  },
  {
    name: "Low Poly",
    icon: Gem,
    id: "low-poly",
    imageUrl: "/lowpoly_cat.png",
  },
  {
    name: "Line Art",
    icon: PenTool,
    id: "line-art",
    imageUrl: "/lineart_cat.png",
  },
  {
    name: "Watercolor",
    icon: Paintbrush2,
    id: "watercolor",
    imageUrl: "/watercolor_cat.png",
  },
  { name: "Pop Art", icon: Shapes, id: "pop-art", imageUrl: "/popart_cat.png" },
  {
    name: "Surrealism",
    icon: Eye,
    id: "surrealism",
    imageUrl: "/surreal_cat.png",
  },
] as const;

export default function ImageNode({
  id,
  data,
  selected,
}: NodeProps<ImageNodeType>) {
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const generateAndStoreImageAction = useAction(
    api.imageNodes.generateAndStoreImage,
  );
  const uploadAndStoreImageAction = useAction(
    api.imageNodes.uploadAndStoreImage,
  );
  const url = useConvexQuery(api.imageNodes.getImageNodeUrl, {
    nodeId: id,
  });
  const imageGenRateLimit = useConvexQuery(
    api.imageNodes.getImageGenerationRateLimit,
  );
  const isRateLimited = imageGenRateLimit ? !imageGenRateLimit.ok : false;
  const retryAfterSeconds = imageGenRateLimit?.retryAfter;
  const isLocked = data.isLocked ?? false;
  const isRunning = data?.internal?.isRunning ?? false;
  const [isDownloading, setIsDownloading] = useState(false);
  const edges = useEdges();

  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");

  const params = useParams();
  const whiteboardId = params?.id as string | undefined;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [isImageLoading, setIsImageLoading] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState("auto");

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const openBanner = useCallback((feature: string) => {
    setBannerFeature(feature);
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  const hoursUntilReset = retryAfterSeconds
    ? Math.ceil(retryAfterSeconds / 3600 / 1000)
    : 0;

  const daysUntilReset =
    hoursUntilReset > 24 ? Math.ceil(hoursUntilReset / 24) : 0;

  useLayoutEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "image",
      updatedData: {
        imageUrl: url ?? null,
        internal: {
          isRateLimited,
          isRunning,
        },
      },
    });
  }, [id, updateNodeData, isRateLimited, url, isRunning]);

  useEffect(() => {
    registerImageAction(id, generateAndStoreImageAction);
    return () => unregisterImageAction(id);
  }, [id, generateAndStoreImageAction]);

  useEffect(() => {
    if (url) {
      setIsImageLoading(true);
    }
  }, [url]);

  const hasIncomingConnections = edges.some((edge) => edge.target === id);

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
        updatedData: { internal: { isRunning: false } },
        nodeType: "image",
      });
    } else if (hasIncomingConnections && !isRateLimited) {
      void executeNode({ nodeId: id });
    } else if (isRateLimited) {
      console.log("Node cannot run: rate limit reached");
      openBanner("Higher Rate Limits");
    } else {
      console.log("Node cannot run: no incoming connections");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!whiteboardId) {
        console.error("No whiteboardId found in route params");
        return;
      }
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

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when image node was rendered",
    );
  }

  const currentStyle =
    IMAGE_STYLES.find((s) => s.id === selectedStyle) ?? IMAGE_STYLES[0];
  const CurrentIcon = currentStyle.icon;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <div className={`relative`}>
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

        <PopoverContent
          side="top"
          align="center"
          sideOffset={10}
          className="nowheel nopan nodrag h-64 w-96 overflow-y-auto p-0"
        >
          <div className="grid grid-cols-3 gap-4 p-4">
            {IMAGE_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyle(style.id);
                  setIsPopoverOpen(false);
                }}
                className={`flex cursor-pointer flex-col items-center rounded p-2 transition-colors ${
                  selectedStyle === style.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {style.imageUrl ? (
                  <Image
                    src={style.imageUrl}
                    className="h-16 w-16 rounded-full"
                    alt={style.name}
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-300"></div>
                )}
                <span className="mt-2 text-sm">{style.name}</span>
              </button>
            ))}
          </div>
        </PopoverContent>

        <div
          className={`overflow-hidden rounded border-2 bg-purple-200 shadow-md ${
            isRateLimited
              ? "border-red-500"
              : `${selected ? "border-blue-500" : "border-white"}`
          }`}
        >
          {isRateLimited && (
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
                        ? `${daysUntilReset} day${
                            daysUntilReset > 1 ? "s" : ""
                          }`
                        : `${hoursUntilReset} hour${
                            hoursUntilReset !== 1 ? "s" : ""
                          }`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openBanner("Higher Rate Limits")}
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
          )}
          {!isRateLimited && (
            <div className="flex items-center justify-between px-1 py-2">
              <div className="flex items-center text-black">
                <ImageIcon size={18} className="mx-1" />
                <span className="mr-2 font-medium">Image</span>
                <PopoverTrigger asChild>
                  <button className="cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900">
                    <CurrentIcon size={18} />
                  </button>
                </PopoverTrigger>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
                  onClick={toggleLock}
                >
                  {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
                </button>
                <button
                  className={`cursor-pointer rounded p-1 ${
                    hasIncomingConnections && !isRateLimited
                      ? "text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
                      : "cursor-not-allowed text-gray-400"
                  }`}
                  onClick={toggleRunning}
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
          )}
          <div className="bg-gray-800 p-2">
            <Handle type="target" position={Position.Top} />
            <div className="group relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
              {isRunning ? (
                <div className="flex flex-col items-center text-gray-400">
                  <Loader2 size={48} className="animate-spin" />
                  <p className="mt-2">Generating image...</p>
                  <button
                    type="button"
                    onClick={() => openBanner("Streaming Images")}
                    className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                  >
                    <span>Upgrade for streaming images</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              ) : url ? (
                <>
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
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
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="absolute top-3 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title={isDownloading ? "Downloading..." : "Download image"}
                  >
                    {isDownloading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                  <button
                    onClick={handleUpload}
                    className="absolute top-3 left-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-700"
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
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <button
                    onClick={handleUpload}
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
                      onClick={() => openBanner("Higher Quality Images")}
                      className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                    >
                      <span>Upgrade for higher quality</span>
                      <ExternalLink size={10} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <Handle type="source" position={Position.Bottom} />
          </div>
        </div>
      </div>
    </Popover>
  );
}
