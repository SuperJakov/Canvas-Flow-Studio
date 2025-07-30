import Image from "next/image";
import {
  Loader2,
  Download,
  Upload,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { useConvexQuery } from "~/helpers/convex";
import { api } from "convex/_generated/api";

interface ImageNodeContentProps {
  id: string;
  url?: string | null;
  isRunning: boolean;
  isImageLoading: boolean;
  isDownloading: boolean;
  isUploading: boolean;
  isRateLimited: boolean;
  onDownload: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onUpload: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onImageLoad: () => void;
  onImageError: () => void;
  onOpenBanner: (feature: string) => void;
}

export function ImageNodeContent({
  isDownloading,
  isUploading,
  isRateLimited,
  onDownload,
  onUpload,
  onImageLoad,
  onImageError,
  onOpenBanner,
  id,
}: ImageNodeContentProps) {
  const imageNode = useConvexQuery(api.imageNodes.getImageNode, {
    nodeId: id,
  });

  if (imageNode?.isGenerating && !imageNode.isPartialImage) {
    return (
      <div className="group relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
        <div className="flex flex-col items-center text-gray-400">
          <Loader2 size={48} className="animate-spin" />
          <p className="mt-2">Generating image...</p>
          <button
            type="button"
            onClick={() => onOpenBanner("Streaming Images")}
            className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
          >
            <span>Upgrade for streaming images</span>
            <ExternalLink size={10} />
          </button>
        </div>
      </div>
    );
  }

  if (imageNode?.imageUrl) {
    return (
      <div className="group relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
        {/* {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="flex flex-col items-center text-gray-400">
              <Loader2 size={32} className="animate-spin" />
              <p className="mt-2 text-sm">Loading image...</p>
            </div>
          </div>
        )} */}
        <div className="relative h-full w-full">
          <Image
            src={imageNode?.imageUrl}
            alt="Generated"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            quality={imageNode.isPartialImage ? 50 : 90}
            priority
            loading="eager"
            onLoad={onImageLoad}
            onError={onImageError}
          />
        </div>
        <button
          onClick={onDownload}
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
          onClick={onUpload}
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
      </div>
    );
  }

  return (
    <div className="group relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
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
            onClick={() => onOpenBanner("Higher Quality Images")}
            className="group mt-2 flex cursor-pointer items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-white"
          >
            <span>Upgrade for higher quality</span>
            <ExternalLink size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
