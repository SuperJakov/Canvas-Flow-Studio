import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { X as LucideX } from "lucide-react";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const { setEdges } = useReactFlow();
  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: 10,
          }}
        >
          <button
            onClick={onEdgeClick}
            style={{
              background: "#fff",
              border: "1px solid #888",
              borderRadius: "50%",
              width: 24,
              height: 24,
              cursor: "pointer",
              fontWeight: "bold",
              color: "#d00",
              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
            aria-label="Delete edge"
          >
            <LucideX size={16} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
