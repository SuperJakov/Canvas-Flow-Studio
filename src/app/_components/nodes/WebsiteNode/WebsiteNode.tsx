"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useAtom } from "jotai";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { useAction } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { WebsiteNodeType } from "~/Types/nodes";
import { useConvexQuery } from "~/helpers/convex";
import {
  registerWebsiteAction,
  unregisterWebsiteAction,
} from "~/execution/nodeActionRegistry";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";
import Portal from "../../Portal";
import { WebsiteNodeHeader } from "./WebsiteNodeHeader";
import { WebsiteNodeContent } from "./WebsiteNodeContent";
import { RateLimitBanner } from "../ImageNode/RateLimitBanner";
import WebsiteNodeFooter from "./WebsiteNodeFooter";

export default function WebsiteNode({
  id,
  data,
  selected,
}: NodeProps<WebsiteNodeType>) {
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const generateAndStoreWebsiteAction = useAction(
    api.websiteNodes.generateAndStoreWebsite,
  );
  useConvexQuery(api.websiteNodes.isGeneratingWebsite, {
    nodeId: id,
  });
  const websiteGenRateLimit = useConvexQuery(
    api.websiteNodes.getWebsiteGenerationRateLimit,
  );
  const isRateLimited = websiteGenRateLimit
    ? websiteGenRateLimit.isRateLimited
    : false;

  const isLocked = data.isLocked ?? false;
  const isRunning = data?.internal?.isRunning ?? false;
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const params = useParams();
  const whiteboardId = params?.id as string | undefined;

  const closeBanner = () => {
    setIsBannerOpen(false);
  };

  const openBanner = () => {
    setIsBannerOpen(true);
  };

  useLayoutEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "website",
      updatedData: {
        internal: {
          isRunning,
        },
      },
    });
  }, [id, updateNodeData, isRunning]);

  useEffect(() => {
    registerWebsiteAction(id, generateAndStoreWebsiteAction);
    return () => unregisterWebsiteAction(id);
  }, [id, generateAndStoreWebsiteAction]);

  const toggleLock = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation(); // Prevent React Flow from interfering

    updateNodeData({
      nodeId: id,
      updatedData: { isLocked: !isLocked },
      nodeType: "website",
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
        nodeType: "website",
      });
    } else if (isRateLimited) {
      openBanner();
    } else {
      void executeNode({ nodeId: id });
    }
  };

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when website node was rendered",
    );
  }

  return (
    <div className="h-full w-full">
      <Portal>
        <UpgradeBanner
          isOpen={isBannerOpen}
          onCloseAction={closeBanner}
          featureName="Higher Website Generation Limits"
        />
      </Portal>

      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded bg-pink-200 shadow-md outline-2 ${
          selected ? "outline-blue-600" : "outline-white"
        }`}
      >
        <NodeResizer
          isVisible={selected && !isLocked}
          minWidth={600}
          minHeight={400}
          maxWidth={1000}
          maxHeight={800}
        />
        {isRateLimited ? (
          <RateLimitBanner onUpgradeClick={openBanner} />
        ) : (
          <WebsiteNodeHeader
            id={id}
            isLocked={isLocked}
            isRunning={isRunning}
            onToggleLock={toggleLock}
            onToggleRunning={toggleRunning}
          />
        )}

        <div className="w-full flex-1 bg-gray-800">
          <Handle type="target" position={Position.Top} />
          <WebsiteNodeContent id={id} />
          <Handle type="source" position={Position.Bottom} />
        </div>
        <WebsiteNodeFooter nodeId={id} />
      </div>
    </div>
  );
}
