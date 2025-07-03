"use client";
import { useCallback, useLayoutEffect, type ChangeEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { InstructionNodeType } from "~/Types/nodes";
import { useAtom } from "jotai";
import {
  edgesAtom,
  executeNodeAtom,
  updateNodeDataAtom,
} from "~/app/whiteboard/atoms";
import { AlertCircle, Lock, LockOpen, Play, Square, Wand2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function InstructionNode({
  data,
  id,
  selected, // The `selected` prop is provided by @xyflow/react
}: NodeProps<InstructionNodeType>) {
  const { isLocked, isRunning, text } = data;
  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const [edges] = useAtom(edgesAtom);

  const detectOutputNodeTypeAction = useAction(
    api.instructionNodes.detectOutputNodeType,
  );

  const hasInGoingConnections = edges.some((edge) => edge.target === id);
  const canRunNode =
    hasInGoingConnections && !!data.internal?.detectOutputNodeTypeAction;

  useLayoutEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: {
        internal: {
          detectOutputNodeTypeAction,
        },
      },
    });
  }, [detectOutputNodeTypeAction, id, updateNodeData]);

  function toggleRunning() {
    if (!isRunning === true) {
      void executeNode({
        nodeId: id,
      });
    }
    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: { isRunning: !isRunning },
    });
  }

  function toggleLock() {
    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: { isLocked: !isLocked },
    });
  }

  const onChange = useCallback(
    (evt: ChangeEvent<HTMLTextAreaElement>) => {
      if (evt.target.value.length > 10000 || isLocked) {
        return;
      }
      updateNodeData({
        nodeId: id,
        nodeType: "instruction",
        updatedData: { text: evt.target.value },
      });
    },
    [id, updateNodeData, isLocked],
  );

  const containerClasses = `overflow-hidden rounded-lg bg-orange-200 shadow-sm outline-2 ${
    selected ? "outline-orange-600" : "outline-gray-200"
  }`;

  return (
    <div className={containerClasses}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center">
          <Wand2 size={16} className="mx-1" />
          <span className="mr-2 font-medium text-black">Instruction</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="nodrag cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
            onClick={toggleLock}
          >
            {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
          </button>
          <button
            className={`cursor-pointer rounded p-1 ${
              canRunNode
                ? "text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
                : "cursor-not-allowed text-gray-400"
            } nodrag`}
            onClick={toggleRunning}
            title={canRunNode ? "Run node" : "Cannot run: no connections"}
            disabled={!canRunNode}
          >
            {isRunning ? (
              <Square size={18} />
            ) : canRunNode ? (
              <Play size={18} fill="currentColor" />
            ) : (
              <AlertCircle size={18} />
            )}
          </button>
        </div>
      </div>
      <div className="bg-gray-700">
        <textarea
          id="text"
          name="text"
          onChange={onChange}
          className={`nodrag field-sizing-content max-h-[130px] min-h-[130px] w-full max-w-[290px] min-w-[290px] resize-none rounded border-none px-2 py-1 text-xl font-bold text-white focus:border-blue-500 focus:outline-none`}
          value={text}
          placeholder="Type..."
          readOnly={isLocked}
          maxLength={10000}
        />
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </div>
  );
}
