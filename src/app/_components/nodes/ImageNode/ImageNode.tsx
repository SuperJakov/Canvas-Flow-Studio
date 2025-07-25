"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Handle, Position, useEdges, useNodes, type NodeProps } from "@xyflow/react";
import { useAction } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { ImageNodeType } from "~/Types/nodes";
import { useConvexQuery } from "~/helpers/convex";
import {
  registerImageAction,
  unregisterImageAction,
} from "~/execution/nodeActionRegistry";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";
import Portal from "../../Portal";
import { ImageNodeHeader } from "./ImageNodeHeader";
import { ImageNodeContent } from "./ImageNodeContent";
import { StyleSelector } from "./StyleSelector";
import { RateLimitBanner } from "./RateLimitBanner";
import type { Style } from "./constants";
import { Popover } from "~/components/ui/popover";

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
  const retryAfterMs = imageGenRateLimit?.retryAfter;
  const isLocked = data.isLocked ?? false;
  const isRunning = data?.internal?.isRunning ?? false;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const edges = useEdges();
  const nodes = useNodes();
  const params = useParams();
  const whiteboardId = params?.id as string | undefined;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openBanner = (feature: string) => {
    setBannerFeature(feature);
    setIsBannerOpen(true);
  };

  const closeBanner = () => {
    setIsBannerOpen(false);
  };

  const hoursUntilReset = retryAfterMs
    ? Math.ceil(retryAfterMs / 3600 / 1000)
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

  const toggleLock = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation(); // Prevent React Flow from interfering

    updateNodeData({
      nodeId: id,
      updatedData: { isLocked: !isLocked },
      nodeType: "image",
    });
  };

  const toggleRunning = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation(); // Prevent React Flow from interfering

    if (isRunning) {
      updateNodeData({
        nodeId: id,
        updatedData: { internal: { isRunning: false } },
        nodeType: "image",
      });
    } else if (isRateLimited) {
      console.log("Node cannot run: rate limit reached");
      openBanner("Higher Rate Limits");
    } else {
      const hasOutgoingTextNode = edges.some(edge => {
        if (edge.source !== id) return false;
        const targetNode = nodes.find(node => node.id === edge.target);
        return targetNode?.type === "textEditor";
      });

      if (hasIncomingConnections || hasOutgoingTextNode) {
        void executeNode({ nodeId: id });
      } else {
        console.log(
          "Node cannot run: no incoming connections or outgoing text nodes",
        );
      }
    }
  };

  const handleDownload = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (!url || isDownloading) return;
    event.stopPropagation(); // Prevent React Flow from interfering

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
  };

  const handleUpload = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation(); // Prevent React Flow from interfering

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        whiteboardId: whiteboardId,
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  const handleStyleChange = (styleId: Style) => {
    updateNodeData({
      nodeType: "image",
      nodeId: id,
      updatedData: {
        style: styleId,
      },
    });
    setIsPopoverOpen(false);
  };

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when image node was rendered",
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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

        <StyleSelector
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          selectedStyle={data.style}
          onStyleChange={handleStyleChange}
        />

        <div
          className={`overflow-hidden rounded bg-purple-200 shadow-md outline-2 ${
            isRateLimited
              ? "outline-red-500"
              : `${selected ? "outline-blue-600" : "outline-white"}`
          }`}
        >
          {isRateLimited ? (
            <RateLimitBanner
              hoursUntilReset={hoursUntilReset}
              daysUntilReset={daysUntilReset}
              onUpgradeClick={() => openBanner("Higher Rate Limits")}
            />
          ) : (
            <ImageNodeHeader
              id={id}
              isLocked={isLocked}
              isRunning={isRunning}
              hasIncomingConnections={hasIncomingConnections}
              isRateLimited={isRateLimited}
              selectedStyle={data.style}
              onToggleLock={toggleLock}
              onToggleRunning={toggleRunning}
              onStylePopoverTrigger={(e) => {
                e.stopPropagation();
                setIsPopoverOpen(true);
              }}
            />
          )}

          <div className="bg-gray-800 p-2">
            <Handle type="target" position={Position.Top} />
            <ImageNodeContent
              url={url}
              isRunning={isRunning}
              isImageLoading={isImageLoading}
              isDownloading={isDownloading}
              isUploading={isUploading}
              isRateLimited={isRateLimited}
              onDownload={handleDownload}
              onUpload={handleUpload}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              onOpenBanner={openBanner}
            />
            <Handle type="source" position={Position.Bottom} />
          </div>
        </div>
      </div>
    </Popover>
  );
}
