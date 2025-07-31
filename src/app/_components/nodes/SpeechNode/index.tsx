"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { SpeechNodeType } from "~/Types/nodes";
import { useAction } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";
import Portal from "../../Portal";
import { useParams } from "next/navigation";
import {
  registerSpeechAction,
  unregisterImageAction,
} from "~/execution/nodeActionRegistry";
import { useConvexQuery } from "~/helpers/convex";

import { SpeechNodeHeader } from "./SpeechNodeHeader";
import { SpeechNodeContent } from "./SpeechNodeContent";
import { RateLimitBanner } from "./RateLimitBanner";

export default function SpeechNode({
  id,
  data,
  selected,
}: NodeProps<SpeechNodeType>) {
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const generateAndStoreSpeechAction = useAction(
    api.speechNodes.generateAndStoreSpeech,
  );
  const speechUrl = useConvexQuery(api.speechNodes.getSpeechUrl, {
    nodeId: id,
  });

  const speechGenRateLimit = useConvexQuery(
    api.speechNodes.getSpeechGenerationRateLimit,
  );
  const isRateLimited = speechGenRateLimit?.isRateLimited;

  const isLocked = data.isLocked ?? false;
  const isRunning = data?.internal?.isRunning ?? false;

  const edges = useEdges();
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");

  const params = useParams();
  const whiteboardId = params?.id as string | undefined;

  const openBanner = (feature: string) => {
    setBannerFeature(feature);
    setIsBannerOpen(true);
  };

  const closeBanner = () => {
    setIsBannerOpen(false);
  };

  const hasIncomingConnections = edges.some((edge) => edge.target === id);

  useEffect(() => {
    registerSpeechAction(id, generateAndStoreSpeechAction);
    return () => unregisterImageAction(id);
  }, [id, generateAndStoreSpeechAction]);

  useEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "speech",
      updatedData: {
        internal: {
          isRateLimited,
          isRunning: isRunning,
        },
      },
    });
  }, [id, updateNodeData, isRateLimited, speechUrl, isRunning]);

  const toggleLock = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    updateNodeData({
      nodeId: id,
      updatedData: { isLocked: !isLocked },
      nodeType: "speech",
    });
  };

  const toggleRunning = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();

    if (isRunning) {
      updateNodeData({
        nodeId: id,
        updatedData: { internal: { isRunning: false } },
        nodeType: "speech",
      });
    } else if (hasIncomingConnections && !isRateLimited) {
      void executeNode({ nodeId: id });
    } else if (isRateLimited) {
      console.log("Node cannot run: rate limit reached");
      openBanner("Higher Rate Limits");
    } else {
      console.log("Node cannot run: no incoming connections");
    }
  };

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when speech node was rendered",
    );
  }

  return (
    <div className="relative">
      <Portal>
        <UpgradeBanner
          isOpen={isBannerOpen}
          onCloseAction={closeBanner}
          featureName={bannerFeature}
        />
      </Portal>

      <div
        className={`overflow-hidden rounded border-2 bg-green-300 shadow-md ${
          isRateLimited
            ? "border-red-500"
            : `${selected ? "border-blue-500" : "border-white"}`
        }`}
      >
        {isRateLimited ? (
          <RateLimitBanner
            onUpgradeClick={() => openBanner("Higher Rate Limits")}
          />
        ) : (
          <SpeechNodeHeader
            isLocked={isLocked}
            isRunning={isRunning}
            hasIncomingConnections={hasIncomingConnections}
            isRateLimited={!!isRateLimited}
            onToggleLock={toggleLock}
            onToggleRunning={toggleRunning}
          />
        )}

        <div className="bg-gray-800 p-2">
          <Handle type="target" position={Position.Top} />
          <SpeechNodeContent
            nodeId={id}
            speechUrl={speechUrl}
            isRunning={isRunning}
            isRateLimited={!!isRateLimited}
            onOpenBanner={openBanner}
          />
          <Handle type="source" position={Position.Bottom} />
        </div>
      </div>
    </div>
  );
}
