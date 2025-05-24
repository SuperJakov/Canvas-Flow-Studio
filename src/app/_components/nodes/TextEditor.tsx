"use client";
import { useCallback, type ChangeEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TextEditorNodeType } from "~/Types/nodes";
import { useAtom } from "jotai";

export default function TextEditorNode({
  data,
  id,
}: NodeProps<TextEditorNodeType>) {
  const onChange = useCallback((evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div>
        <input
          id="text"
          name="text"
          onChange={onChange}
          className="nodrag w-full rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:outline-none"
          value={data.text}
        />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
}
