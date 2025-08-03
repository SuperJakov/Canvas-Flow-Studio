import { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Download,
  ExternalLink,
  Volume2,
} from "lucide-react";

import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { pcmToWavBlob } from "./utils";

interface SpeechNodeContentProps {
  nodeId: string;
  speechUrl: string | null | undefined;
  isRunning: boolean;
  isRateLimited: boolean;
  onOpenBanner: (feature: string) => void;
}

export function SpeechNodeContent({
  nodeId,
  speechUrl,
  isRunning,
  isRateLimited,
  onOpenBanner,
}: SpeechNodeContentProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [speechData, setSpeechData] = useState<string>("");
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

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

  const handleDownload = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (!speechData || isDownloading) return;
    event.stopPropagation();

    setIsDownloading(true);
    try {
      const link = document.createElement("a");
      link.href = speechData;
      link.download = `speech-${nodeId}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download speech:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const heightClass =
    isRunning || isConverting
      ? "h-[110px]"
      : speechData || conversionError
        ? "h-[90px]"
        : "h-[90px]";

  return (
    <div
      className={`relative flex w-[340px] items-center justify-center bg-gray-800 transition-[height] duration-300 ease-in-out ${heightClass}`}
    >
      {isRunning ? (
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 size={48} className="animate-spin" />
          <p className="mt-2">Generating speech...</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenBanner("Streaming Speech");
            }}
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
            title={isDownloading ? "Downloading..." : "Download speech (WAV)"}
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
              onClick={(e) => {
                e.stopPropagation();
                onOpenBanner("Higher Quality Speech");
              }}
              className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
            >
              <span>Upgrade for higher quality</span>
              <ExternalLink size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
