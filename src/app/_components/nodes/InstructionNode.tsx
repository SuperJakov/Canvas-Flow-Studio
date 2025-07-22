// File: InstructionNode.tsx
"use client";

import { useLayoutEffect, useState, type ChangeEvent } from "react";
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
import { useConvexQuery } from "~/helpers/convex";
import { RateLimitBanner } from "./ImageNode";
import Portal from "../Portal";
import UpgradeBanner from "~/app/whiteboard/UpgradeBanner";

export default function InstructionNode({
  data,
  id,
  selected,
}: NodeProps<InstructionNodeType>) {
  const { isLocked, internal, text } = data;
  const isRunning = internal?.isRunning ?? false;

  const [, updateNodeData] = useAtom(updateNodeDataAtom);
  const [, executeNode] = useAtom(executeNodeAtom);
  const [edges] = useAtom(edgesAtom);

  const instructionUseRateLimit = useConvexQuery(
    api.instructionNodes.getInstructionUseRateLimit,
  );

  const detectOutputNodeTypeAction = useAction(
    api.instructionNodes.detectOutputNodeType,
  );

  const isRateLimited = instructionUseRateLimit
    ? !instructionUseRateLimit.ok
    : false;
  const retryAfterMs = instructionUseRateLimit?.retryAfter ?? 0;

  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const openBanner = () => setIsBannerOpen(true);
  const closeBanner = () => setIsBannerOpen(false);

  const hoursUntilReset = Math.ceil(retryAfterMs / 1000 / 3600);
  const daysUntilReset =
    hoursUntilReset > 24 ? Math.ceil(hoursUntilReset / 24) : 0;

  useLayoutEffect(() => {
    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: {
        internal: {
          detectOutputNodeTypeAction,
          isRunning,
          isRateLimited,
        },
      },
    });
  }, [
    detectOutputNodeTypeAction,
    id,
    updateNodeData,
    isRunning,
    isRateLimited,
  ]);

  const hasInGoingConnections = edges.some((edge) => edge.target === id);
  const canRunNode = hasInGoingConnections;

  const toggleRunning = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();

    if (isRateLimited) {
      openBanner();
      return;
    }

    const nextRunning = !isRunning;
    if (nextRunning) {
      void executeNode({ nodeId: id });
    }

    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: { internal: { isRunning: nextRunning } },
    });
  };

  const toggleLock = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();

    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: { isLocked: !isLocked },
    });
  };

  const handleTextChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    if (evt.target.value.length > 10_000 || isLocked) return;

    updateNodeData({
      nodeId: id,
      nodeType: "instruction",
      updatedData: { text: evt.target.value },
    });
  };

  const outlineColor =
    selected && !isRateLimited ? "outline-blue-600" : "outline-gray-200";
  const containerClasses = `overflow-hidden rounded-lg bg-orange-200 shadow-sm outline-2 ${outlineColor}`;

  return (
    <div className="relative">
      <Portal>
        <UpgradeBanner
          isOpen={isBannerOpen}
          onCloseAction={closeBanner}
          featureName="Higher Rate Limits"
        />
      </Portal>

      <div
        className={`${containerClasses} ${isRateLimited ? "border-2 border-red-500" : ""}`}
      >
        {isRateLimited ? (
          <RateLimitBanner
            hoursUntilReset={hoursUntilReset}
            daysUntilReset={daysUntilReset}
            onUpgradeClick={openBanner}
          />
        ) : (
          <>
            <Handle type="target" position={Position.Top} />
            <Header
              isLocked={isLocked}
              canRunNode={canRunNode}
              isRunning={isRunning}
              onToggleLock={toggleLock}
              onToggleRunning={toggleRunning}
            />
          </>
        )}

        <div className="bg-gray-700">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Type..."
            readOnly={isLocked}
            maxLength={10_000}
            className="nodrag field-sizing-content max-h-[130px] min-h-[130px] w-full max-w-[290px] min-w-[290px] resize-none rounded border-none px-2 py-1 text-xl font-bold text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sub-components                                                         */
/* ---------------------------------------------------------------------- */
interface HeaderProps {
  isLocked: boolean;
  canRunNode: boolean;
  isRunning: boolean;
  onToggleLock: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  onToggleRunning: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}

const Header: React.FC<HeaderProps> = ({
  isLocked,
  canRunNode,
  isRunning,
  onToggleLock,
  onToggleRunning,
}) => (
  <div className="flex items-center justify-between px-1 py-2">
    <div className="flex items-center text-black">
      <Wand2 size={16} className="mx-1" />
      <span className="mr-2 font-medium">Instruction</span>
    </div>

    <div className="flex items-center space-x-2">
      <button
        className="nodrag cursor-pointer rounded p-1 text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
        onClick={onToggleLock}
        title={isLocked ? "Unlock" : "Lock"}
      >
        {isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
      </button>

      <button
        className={`nodrag rounded p-1 ${
          canRunNode
            ? "cursor-pointer text-gray-700 hover:bg-gray-500/20 hover:text-gray-900"
            : "cursor-not-allowed text-gray-400"
        }`}
        onClick={onToggleRunning}
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
);
