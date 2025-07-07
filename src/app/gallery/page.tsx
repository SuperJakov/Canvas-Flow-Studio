"use client";

import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import Image from "next/image";
import Loading from "~/app/loading";
import { useState, useEffect } from "react";
import {
  Download,
  Loader2,
  X,
  ExternalLink,
  Images,
  Archive,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import type { Doc } from "convex/_generated/dataModel";
import Link from "next/link";
import JSZip from "jszip";

const formatDate = (timestamp: bigint | number | undefined | null): string => {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp));
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return formatDistanceToNow(date, { addSuffix: true });
};

interface DownloadProgress {
  current: number;
  total: number;
  status: string;
}

export default function GalleryPage() {
  const allImages = useQuery(api.imageNodes.getAllGeneratedImages);
  const [fullscreenImage, setFullscreenImage] =
    useState<Doc<"imageNodes"> | null>(null);
  const [downloadingImages, setDownloadingImages] = useState<Set<string>>(
    new Set(),
  );
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);

  const handleDownload = async (
    imageUrl: string,
    imageId: string,
    filename?: string,
  ) => {
    // Prevent duplicate downloads
    if (downloadingImages.has(imageId)) return;

    setDownloadingImages((prev) => new Set([...prev, imageId]));

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename ?? `generated-image-${imageId}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
      // You could add a toast notification here
    } finally {
      setDownloadingImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!allImages || allImages.length === 0 || downloadingAll) return;

    setDownloadingAll(true);
    setDownloadProgress({
      current: 0,
      total: allImages.length,
      status: "Preparing...",
    });

    try {
      const zip = new JSZip();
      const validImages = allImages.filter((image) => image.imageUrl);

      setDownloadProgress({
        current: 0,
        total: validImages.length,
        status: "Downloading images...",
      });

      // Download all images in parallel
      let completedCount = 0;
      const downloadPromises = validImages.map(async (image, index) => {
        if (!image?.imageUrl) return null;

        try {
          const response = await fetch(image.imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }

          const blob = await response.blob();
          const filename = `generated-image-${index + 1}-${image._id}.png`;

          // Update progress atomically
          completedCount++;
          setDownloadProgress({
            current: completedCount,
            total: validImages.length,
            status: `Downloading images...`,
          });

          return { filename, blob };
        } catch (error) {
          console.error(`Failed to download image ${index + 1}:`, error);
          // Still increment count for failed downloads
          completedCount++;
          setDownloadProgress({
            current: completedCount,
            total: validImages.length,
            status: `Downloading images...`,
          });
          return null;
        }
      });

      // Wait for all downloads to complete
      const downloadResults = await Promise.allSettled(downloadPromises);

      // Add successfully downloaded images to zip
      downloadResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          zip.file(result.value.filename, result.value.blob);
        }
      });

      setDownloadProgress({
        current: validImages.length,
        total: validImages.length,
        status: "Creating zip file...",
      });

      // Generate zip file with 0% compression
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "STORE", // 0% compression
        compressionOptions: {
          level: 0,
        },
      });

      // Download the zip file
      const url = window.URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `gallery-images-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloadProgress({
        current: validImages.length,
        total: validImages.length,
        status: "Download complete!",
      });

      // Clear progress after 2 seconds
      setTimeout(() => {
        setDownloadProgress(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to download all images:", error);
      setDownloadProgress({
        current: 0,
        total: allImages.length,
        status: "Download failed",
      });

      // Clear progress after 3 seconds
      setTimeout(() => {
        setDownloadProgress(null);
      }, 3000);
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleImageClick = (image: Doc<"imageNodes">) => {
    setFullscreenImage(image);
    // Prevent body scroll when modal opens
    document.body.style.overflow = "hidden";
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
    // Restore body scroll when modal closes
    document.body.style.overflow = "unset";
  };

  // Cleanup effect to restore scroll if component unmounts while modal is open
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (allImages === undefined) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Image Gallery</h1>
            <p className="mt-2 text-sm text-gray-400">
              {allImages.length} {allImages.length === 1 ? "image" : "images"}
            </p>
          </div>

          {/* Download All Button */}
          {allImages.length > 0 && (
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloadingAll ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Archive size={18} />
                )}
                Download All ({allImages.length})
              </button>

              {/* Progress Bar */}
              {downloadProgress && (
                <div className="w-64">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.round((downloadProgress.current / downloadProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          {allImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-16">
              <Images size={40} className="text-gray-400" />
              <p className="text-gray-400">
                No images found. Generate some images to see them here!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allImages.map((image, index) => (
                <div
                  key={index}
                  className="group flex flex-col overflow-hidden rounded-lg bg-gray-700 shadow-lg"
                >
                  <div className="relative aspect-square w-full bg-gray-600">
                    {image.imageUrl ? (
                      <>
                        <Image
                          src={image.imageUrl}
                          alt={`Generated image ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="cursor-pointer object-cover"
                          onClick={() => handleImageClick(image)}
                          quality={100}
                          priority={true}
                        />
                        {/* Download button - appears on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDownload(
                              image.imageUrl!,
                              image._id,
                              `generated-image-${index + 1}.png`,
                            );
                          }}
                          disabled={downloadingImages.has(image._id)}
                          className="absolute top-3 right-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title={
                            downloadingImages.has(image._id)
                              ? "Downloading..."
                              : "Download image"
                          }
                        >
                          {downloadingImages.has(image._id) ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <p className="text-gray-400">Image not available</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="bg-opacity-90 fixed inset-0 z-50 flex overflow-hidden backdrop-blur-3xl">
          {/* Close button */}
          <button
            onClick={handleCloseFullscreen}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700"
            title="Close fullscreen"
          >
            <X size={20} />
          </button>

          {/* Image */}
          <div className="flex flex-1 items-center justify-center overflow-hidden p-8">
            <div className="relative h-full w-full">
              {fullscreenImage.imageUrl && (
                <Image
                  src={fullscreenImage.imageUrl}
                  alt="Fullscreen image"
                  fill
                  sizes="100vw"
                  className="object-contain"
                  quality={100}
                  priority={true}
                />
              )}
            </div>
          </div>

          {/* Right sidebar with image details */}
          <div className="flex w-80 flex-col bg-gray-800 p-6">
            <h3 className="mb-4 text-xl font-bold">Image Details</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">
                  Created
                </label>
                <p className="text-white">
                  {formatDate(fullscreenImage._creationTime)}
                </p>
              </div>

              {fullscreenImage.whiteboardId && (
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Whiteboard
                  </label>
                  <Link href={`/whiteboard/${fullscreenImage.whiteboardId}`}>
                    <button className="mt-2 flex cursor-pointer items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                      <ExternalLink size={16} />
                      View in Whiteboard
                    </button>
                  </Link>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-400">
                  Prompt
                </label>
                <p className="mt-1 rounded bg-gray-700 p-3 text-sm text-white">
                  {"Prompt goes here"}
                </p>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() =>
                    fullscreenImage.imageUrl &&
                    handleDownload(
                      fullscreenImage.imageUrl,
                      fullscreenImage._id,
                      `generated-image-${fullscreenImage._id}.png`,
                    )
                  }
                  disabled={downloadingImages.has(fullscreenImage._id)}
                  className="flex cursor-pointer items-center gap-2 rounded bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {downloadingImages.has(fullscreenImage._id) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  Download Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
