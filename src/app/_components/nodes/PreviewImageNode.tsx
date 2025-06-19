"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import Image from "next/image";
import { GripVertical, ImageIcon } from "lucide-react";
import type { PreviewImageNodeType } from "~/Types/nodes";

export default function PreviewImageNode({
  data,
}: NodeProps<PreviewImageNodeType>) {
  return (
    <div className="overflow-hidden rounded border-2 border-white bg-purple-200 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center">
          <GripVertical size={18} />
          <ImageIcon size={18} className="mr-1" />
          <span className="mr-2 font-medium text-black">Image</span>
        </div>
      </div>

      {/* Content */}
      <Handle type="target" position={Position.Top} />
      <div className="relative flex h-[300px] w-[300px] items-center justify-center bg-gray-800">
        {data.imageUrl ? (
          <div className="relative h-full w-full">
            <Image
              src={data.imageUrl}
              alt="Preview"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              quality={75}
              loading="eager"
              priority
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon size={24} />
            <p className="mt-1 text-sm">No image</p>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
