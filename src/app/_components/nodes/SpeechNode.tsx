"use client";

import { useCallback, useEffect, useState, useRef } from "react";
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

// Helper function to format time in MM:SS
const formatTime = (time: number) => {
  if (isNaN(time) || time === 0) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
};

// --- Custom Audio Player Component ---
function CustomAudioPlayer({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const wasPlayingRef = useRef(false);

  // Effect to sync component state with audio element events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    // Initial sync
    if (audio.readyState >= 2) setAudioData();
    setIsPlaying(!audio.paused);

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [src]);

  // Toggle play/pause button action
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  };

  // --- Scrubbing Logic ---

  // Calculates and sets the new audio time based on mouse position
  const handleSeek = useCallback(
    (e: MouseEvent) => {
      const audio = audioRef.current;
      const progressBar = progressBarRef.current;
      if (!audio || !progressBar || !duration) return;

      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(1, clickX / width));
      const newTime = duration * percentage;

      if (isFinite(newTime)) {
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration],
  );

  // Effect to handle mouse move and mouse up for scrubbing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleSeek(e);
    };
    const handleMouseUp = () => {
      if (wasPlayingRef.current) {
        void audioRef.current?.play();
      }
      setIsScrubbing(false);
    };

    if (isScrubbing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isScrubbing, handleSeek]);

  // Initiates scrubbing on mouse down
  const handleMouseDownOnBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    e.preventDefault();
    wasPlayingRef.current = !audio.paused;
    if (!audio.paused) {
      audio.pause();
    }

    setIsScrubbing(true);
    handleSeek(e.nativeEvent);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex w-full items-center gap-3 rounded-lg bg-gray-700 p-2 text-white ${className ?? ""}`}
    >
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      <button
        onClick={togglePlayPause}
        className="focus:ring-opacity-75 flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 focus:ring-2 focus:ring-green-400 focus:outline-none"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Square size={16} fill="white" />
        ) : (
          <Play size={16} fill="white" className="ml-0.5" />
        )}
      </button>

      <div className="flex flex-grow flex-col justify-center gap-1.5">
        <div
          ref={progressBarRef}
          onMouseDown={handleMouseDownOnBar}
          className="group h-2 w-full cursor-pointer rounded-full bg-gray-600"
        >
          <div
            className="h-full rounded-full bg-green-400"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
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

  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");

  const params = useParams();
  const whiteboardId = params?.id as string | undefined;

  const [speechData, setSpeechData] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

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
    let objectUrl: string | null = null;

    async function convertAndSetUrl() {
      if (!speechUrl) {
        setSpeechData("");
        setConversionError(null);
        return;
      }

      setIsConverting(true);
      setConversionError(null);
      setSpeechData("");

      try {
        const response = await fetch(speechUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio data: ${response.statusText}`);
        }
        const pcmData = await response.arrayBuffer();
        const wavBlob = pcmToWavBlob(new Uint8Array(pcmData));
        objectUrl = URL.createObjectURL(wavBlob);
        setSpeechData(objectUrl);
      } catch (error) {
        console.error("Failed to process speech data:", error);
        setConversionError(
          error instanceof Error ? error.message : "An unknown error occurred.",
        );
      } finally {
        setIsConverting(false);
      }
    }

    void convertAndSetUrl();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
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

  const handleDownload = useCallback(() => {
    if (!speechData || isDownloading) return;

    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = speechData;
      link.download = `speech-${id}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download speech:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [speechData, id, isDownloading]);

  if (!whiteboardId) {
    throw new Error(
      "No whiteboardId found in route params when speech node was rendered",
    );
  }

  const heightClass =
    isRunning || isConverting
      ? "h-[110px]"
      : speechData || conversionError
        ? "h-[90px]"
        : "h-[90px]";

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
          <div
            className={`relative flex w-[340px] items-center justify-center bg-gray-800 transition-[height] duration-300 ease-in-out ${heightClass}`}
          >
            {isRunning ? (
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 size={48} className="animate-spin" />
                <p className="mt-2">Generating speech...</p>
                <button
                  type="button"
                  onClick={() => openBanner("Streaming Speech")}
                  className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
                >
                  <span>Upgrade for streaming speech</span>
                  <ExternalLink size={10} />
                </button>
              </div>
            ) : isConverting ? (
              <div className="flex flex-col items-center text-gray-400">
                <Loader2 size={48} className="animate-spin" />
                <p className="mt-2">Preparing audio...</p>
              </div>
            ) : conversionError ? (
              <div className="flex flex-col items-center px-4 text-center text-red-400">
                <AlertCircle size={24} />
                <p className="mt-1 text-sm">Could not load audio</p>
              </div>
            ) : speechData ? (
              <div className="flex w-full items-center gap-2 px-2">
                <CustomAudioPlayer src={speechData} className="nodrag" />
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title={
                    isDownloading ? "Downloading..." : "Download speech (WAV)"
                  }
                >
                  {isDownloading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <Volume2 size={24} />
                <p className="mt-1 text-sm">No speech generated yet</p>
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
