"use client";
import { useEffect, type ChangeEvent } from "react";
import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import type { TextEditorNodeType } from "~/Types/nodes";
import { useAtom } from "jotai";
import {
  edgesAtom,
  executeNodeAtom,
  nodesAtom,
  updateNodeDataAtom,
} from "~/app/whiteboard/atoms";
import { AlertCircle, Lock, LockOpen, Play, Square, Type } from "lucide-react";
import { isNodeExecutable as isNodeExecutableFn } from "~/execution/executionLogic";
import { api } from "../../../../convex/_generated/api";
import { useAction } from "convex/react";
import {
  registerTextAction,
  unregisterTextAction,
  registerImageDescriptionAction,
  unregisterImageDescriptionAction,
} from "~/execution/nodeActionRegistry";

export default function TextEditorNode({
  data,
  id,
  selected, // The `selected` prop is provided by @xyflow/react
}: NodeProps<TextEditorNodeType>) {
  const { isLocked, internal, text } = data;
  const isRunning = internal?.isRunning;
  const modifyTextAction = useAction(api.textNodes.modifyText);
  const describeImagesAction = useAction(api.textNodes.describeImages);

  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const [nodes] = useAtom(nodesAtom);
  const [edges] = useAtom(edgesAtom);

  const thisNode = nodes.find((node) => node.id === id);
  const isNodeExecutableResult = thisNode
    ? isNodeExecutableFn(thisNode, edges)
    : null;
  const isNodeExecutable = isNodeExecutableResult?.isExecutable ?? false;
  const isNodeExecutableReason = isNodeExecutableResult?.reason;

  useEffect(() => {
    registerTextAction(id, modifyTextAction);
    registerImageDescriptionAction(id, describeImagesAction);
    return () => {
      unregisterTextAction(id);
      unregisterImageDescriptionAction(id);
    };
  }, [id, modifyTextAction, describeImagesAction]);

  function toggleRunning(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    event.stopPropagation(); // Prevent React Flow from interfering

    if (!isRunning === true) {
      void executeNode({
        nodeId: id,
      });
    }
    updateNodeData({
      nodeId: id,
      nodeType: "textEditor",
      updatedData: { internal: { isRunning: !isRunning } },
    });
  }

  function toggleLock(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.stopPropagation(); // Prevent React Flow from interfering

    updateNodeData({
      nodeId: id,
      nodeType: "textEditor",
      updatedData: { isLocked: !isLocked },
    });
  }

  const onChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    if (evt.target.value.length > 10000 || isLocked) {
      return;
    }
    updateNodeData({
      nodeId: id,
      nodeType: "textEditor",
      updatedData: { text: evt.target.value },
    });
  };

  const containerClasses = `
    flex h-full flex-col overflow-hidden rounded-lg bg-blue-200 shadow-sm outline-2
    ${selected ? "outline-blue-600" : "outline-gray-200"}
  `;

  const runButtonEnabled = isNodeExecutable;

  return (
    <div className={containerClasses}>
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />

      {/* Resizer – visible only when node is selected & unlocked */}
      <NodeResizer
        isVisible={selected && !isLocked}
        minWidth={270}
        minHeight={170}
        maxWidth={500}
        maxHeight={500}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="handle flex cursor-grab items-center text-black">
          <Type size={16} className="mx-1" />
          <span className="mr-2 font-medium">Text</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Lock / unlock */}
          <button
            className="nodrag cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
            onClick={toggleLock}
            title={isLocked ? "Unlock node" : "Lock node"}
          >
            {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
          </button>

          {/* Run / stop */}
          <button
            className={`nodrag rounded p-1 ${
              runButtonEnabled
                ? "cursor-pointer text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
                : "cursor-not-allowed text-gray-400"
            }`}
            onClick={toggleRunning}
            title={
              !isNodeExecutable
                ? `Cannot run: ${isNodeExecutableReason ?? "Unknown reason"}`
                : isRunning
                  ? "Stop node"
                  : "Run node"
            }
            disabled={!runButtonEnabled}
          >
            {isRunning ? (
              <Square size={18} />
            ) : runButtonEnabled ? (
              <Play size={18} fill="currentColor" />
            ) : (
              <AlertCircle size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow bg-gray-700">
        <textarea
          id="text"
          name="text"
          onChange={onChange}
          className="nodrag custom-scrollbar h-full w-full resize-none rounded bg-transparent px-2 py-1 text-xl font-bold text-white outline-none"
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
