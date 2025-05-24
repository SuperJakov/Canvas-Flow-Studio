"use client";
import { useCallback, type ChangeEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { TextEditorNodeType } from "~/Types/nodes";
import { useAtom } from "jotai";
import { updateNodeDataAtom } from "~/app/whiteboard/atoms";

export default function TextEditorNode({
  data,
  id,
}: NodeProps<TextEditorNodeType>) {
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const onChange = useCallback(
    (evt: ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData({
        nodeId: id,
        nodeType: "textEditor",
        updatedData: { text: evt.target.value },
      });
    },
    [id, updateNodeData],
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <Handle type="target" position={Position.Top} />
      <div>
        <textarea
          id="text"
          name="text"
          onChange={onChange}
          className={`nodrag field-sizing-content max-h-[130px] min-h-[130px] w-full max-w-[290px] min-w-[290px] resize-none rounded border border-gray-300 px-2 py-1 text-xl font-bold focus:border-blue-500 focus:outline-none`}
          value={data.text}
        />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
}
