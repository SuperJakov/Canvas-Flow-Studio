"use client";

import { useCallback, useEffect, useState } from "react";
import { useAtom } from "jotai";
import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import Image from "next/image";
import {
  GripVertical,
  Lock,
  LockOpen,
  Play,
  Square,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Download,
} from "lucide-react";
import { updateNodeDataAtom, executeNodeAtom } from "~/app/whiteboard/atoms";
import type { ImageNodeType } from "~/Types/nodes";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function ImageNode({ id, data }: NodeProps<ImageNodeType>) {
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const generateAndStoreImageAction = useAction(
    api.imageNodes.generateAndStoreImage,
  );
  const url = useQuery(api.imageNodes.getImageNodeUrl, {
    nodeId: id,
  });
  const isLocked = data.isLocked ?? false;
  const isRunning = data.isRunning ?? false;
  const [isDownloading, setIsDownloading] = useState(false);
  const edges = useEdges();

  useEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "image",
      updatedData: {
        imageUrl: url ?? null,
      },
    });
  }, [url, id, updateNodeData]);
  useEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "image",
      updatedData: {
        internal: {
          generateAndStoreImageAction,
        },
      },
    });
  }, [generateAndStoreImageAction, id, updateNodeData]);
  // Check if this node has any incoming connections
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
        updatedData: { isRunning: false },
        nodeType: "image",
      });
    } else if (hasIncomingConnections) {
      void executeNode({ nodeId: id });
    } else {
      console.log("Node cannot run: no incoming connections");
    }
  }, [id, isRunning, hasIncomingConnections, updateNodeData, executeNode]);

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

  return (
    <div className="overflow-hidden rounded border-2 border-white bg-purple-200 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center">
          <GripVertical size={18} />
          <ImageIcon size={18} className="mr-1" />
          <span className="mr-2 font-medium text-black">Image</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
            onClick={toggleLock}
          >
            {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
          </button>
          <button
            className={`cursor-pointer rounded p-1 ${hasIncomingConnections ? "text-gray-700 hover:bg-gray-500/20 hover:text-gray-900" : "cursor-not-allowed text-gray-400"}`}
            onClick={toggleRunning}
            title={
              hasIncomingConnections
                ? "Run node"
                : "Cannot run: no incoming text connection"
            }
            disabled={!hasIncomingConnections}
          >
            {isRunning ? (
              <Square size={18} />
            ) : hasIncomingConnections ? (
              <Play size={18} fill="currentColor" />
            ) : (
              <AlertCircle size={18} />
            )}
          </button>
        </div>
      </div>{" "}
      {/* Content */}
      <div className="bg-gray-700 p-2">
        <Handle type="target" position={Position.Top} />
        <div className="group relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
          {isRunning ? (
            <div className="flex flex-col items-center text-gray-400">
              <Loader2 size={48} className="animate-spin" />
              <p className="mt-2">Generating image...</p>
            </div>
          ) : url ? (
            <>
              <div className="relative h-full w-full">
                <Image
                  src={url}
                  alt="Generated"
                  fill
                  className="object-contain"
                  quality={75}
                  loading="eager"
                />
              </div>
              {/* Download button - appears on hover */}
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
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <ImageIcon size={24} />
              <p className="mt-1 text-sm">No image generated yet</p>
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    </div>
  );
}
