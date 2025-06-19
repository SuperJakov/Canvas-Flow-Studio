"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GripVertical } from "lucide-react";
import type { PreviewTextNodeType } from "~/Types/nodes";

export default function PreviewTextNode({
  data,
}: NodeProps<PreviewTextNodeType>) {
  return (
    <div className="overflow-hidden rounded-lg bg-blue-200 shadow-sm outline-2 outline-gray-200">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center">
          <GripVertical size={18} />
          <span className="mr-2 font-medium text-black">Text</span>
        </div>
      </div>
      <div className="bg-gray-700">
        <div className="field-sizing-content max-h-[130px] min-h-[130px] w-full max-w-[290px] min-w-[290px] resize-none rounded border-none px-2 py-1 text-xl font-bold text-white">
          {data.text}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
