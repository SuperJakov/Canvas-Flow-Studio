"use client";

import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import {
  GripVertical,
  Lock,
  LockOpen,
  Play,
  Square,
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  Volume2,
} from "lucide-react";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { SpeechNodeType } from "~/Types/nodes";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";
import Portal from "../Portal";
import { useParams } from "next/navigation";

function pcmToWavBlob(pcmData: Uint8Array, sampleRate = 24000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const wavBuffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(wavBuffer);

  let offset = 0;

  const writeString = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      view.setUint8(offset++, s.charCodeAt(i));
    }
  };

  writeString("RIFF");
  view.setUint32(offset, 36 + pcmData.length, true);
  offset += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(offset, 16, true);
  offset += 4; // Subchunk1Size
  view.setUint16(offset, 1, true);
  offset += 2; // AudioFormat (PCM)
  view.setUint16(offset, numChannels, true);
  offset += 2;
  view.setUint32(offset, sampleRate, true);
  offset += 4;
  view.setUint32(offset, byteRate, true);
  offset += 4;
  view.setUint16(offset, blockAlign, true);
  offset += 2;
  view.setUint16(offset, bitsPerSample, true);
  offset += 2;
  writeString("data");
  view.setUint32(offset, pcmData.length, true);
  offset += 4;

  for (const byte of pcmData) {
    view.setUint8(offset++, byte);
  }

  return new Blob([view], { type: "audio/wav" });
}

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
  const speechUrl = useQuery(api.speechNodes.getSpeechUrl, {
    nodeId: id,
  });

  const speechGenRateLimit = useQuery(
    api.speechNodes.getSpeechGenerationRateLimit,
  );
  const isRateLimited = speechGenRateLimit ? !speechGenRateLimit.ok : false;
  const retryAfterSeconds = speechGenRateLimit?.retryAfter;

  const isLocked = data.isLocked ?? false;
  const isRunning = data.isRunning ?? false;

  const [isDownloading, setIsDownloading] = useState(false);
  const edges = useEdges();

  // State for controlling the upgrade banner
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");

  // Get whiteboardId from route params
  const params = useParams();
  const whiteboardId = params?.id as string | undefined;
  const [speechData, setSpeechData] = useState<string>("");

  const openBanner = useCallback((feature: string) => {
    setBannerFeature(feature);
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    setIsBannerOpen(false);
  }, []);

  // Calculate hours until reset from retryAfter (in milliseconds)
  const hoursUntilReset = retryAfterSeconds
    ? Math.ceil(retryAfterSeconds / 3600 / 1000)
    : 0;

  const daysUntilReset =
    hoursUntilReset > 24 ? Math.ceil(hoursUntilReset / 24) : 0;

  // Check if this node has any incoming connections
  const hasIncomingConnections = edges.some((edge) => edge.target === id);

  useEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "speech",
      updatedData: {
        speechUrl: speechUrl ?? null,
        internal: {
          generateAndStoreSpeechAction,
          isRateLimited,
        },
      },
    });
  }, [
    generateAndStoreSpeechAction,
    id,
    updateNodeData,
    isRateLimited,
    speechUrl,
  ]);
  useEffect(() => {
    async function convertIfNeeded() {
      if (!speechUrl) return;
      const pcmData = await (await fetch(speechUrl)).arrayBuffer();
      const wavBlob = pcmToWavBlob(new Uint8Array(pcmData));
      const url = URL.createObjectURL(wavBlob);

      setSpeechData(url);
    }
    void convertIfNeeded();
  }, [speechUrl]);
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
    if (!speechUrl || isDownloading) return;

    setIsDownloading(true);
    try {
      const response = await fetch(speechUrl);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `speech-${id}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download speech:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [speechUrl, id, isDownloading]);

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when speech node was rendered",
    );
  }

  return (
    <div className={`relative`}>
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
        {/* Rate limit warning - compact header bar */}
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
                      ? `${daysUntilReset} day${daysUntilReset > 1 ? "s" : ""}`
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
        {/* Header */}
        {!isRateLimited && (
          <div className="flex items-center justify-between px-1 py-2">
            <div className="flex items-center">
              <GripVertical size={18} />
              <Volume2 size={18} className="mr-1" />
              <span className="mr-2 font-medium text-black">Speech</span>
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
        {/* Content */}
        <div className="bg-gray-800 p-2">
          <Handle type="target" position={Position.Top} />
          <div className="group relative flex min-h-[70px] items-center justify-center bg-gray-800">
            {isRunning ? (
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 size={48} className="animate-spin" />
                <p className="mt-2">Generating speech...</p>
                {/* Show upgrade message during generation - non-intrusive */}
                <button
                  type="button"
                  onClick={() => openBanner("Streaming Speech")}
                  className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                >
                  <span>Upgrade for streaming speech</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            ) : speechUrl ? (
              <>
                {/* Speech is generated - no upgrade message here to avoid interrupting */}
                <div className="relative h-full w-full">
                  <audio
                    src={speechData === "" ? undefined : speechData}
                    controls
                  />
                </div>
                {/* Download button - appears on hover */}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="absolute top-3 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title={isDownloading ? "Downloading..." : "Download speech"}
                >
                  {isDownloading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Volume2 size={24} />
                <p className="mt-1 text-sm">No speech generated yet</p>
                {/* Show upgrade message when idle and not rate limited - helpful context */}
                {!isRateLimited && (
                  <button
                    type="button"
                    onClick={() => openBanner("Higher Quality Speech")}
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
  );
}
