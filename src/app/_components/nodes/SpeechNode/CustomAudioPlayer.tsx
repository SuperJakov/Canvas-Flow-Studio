import { useEffect, useState, useRef, useCallback } from "react";
import { Play, Square } from "lucide-react";
import { Progress } from "~/components/ui/progress";

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

interface CustomAudioPlayerProps {
  src: string;
  className?: string;
}

export function CustomAudioPlayer({ src, className }: CustomAudioPlayerProps) {
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
          className="group cursor-pointer"
        >
          <Progress
            value={progressPercentage}
            className={`h-2 w-full bg-gray-600 [&>div]:bg-green-400 ${
              isScrubbing ? "[&>div]:!transition-none" : ""
            }`}
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
