"use client";
import { useCallback, type DragEvent } from "react";
import {
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  type EdgeChange,
  type NodeChange,
  type Connection,
  Background,
  BackgroundVariant,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "./config";
import type { AppNode } from "~/Types/nodes";
import { edgesAtom, nodesAtom } from "./atoms";
import { useAtom } from "jotai";
import { useDnD } from "./DnDContext";
import { v4 as uuidv4 } from "uuid";

export default function Whiteboard() {
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [type] = useDnD();
  const { screenToFlowPosition } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      // project was renamed to screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      let newNode: AppNode | undefined;

      switch (type) {
        case "textEditor":
          newNode = {
            id: uuidv4(),
            type,
            position,
            data: { text: "", isLocked: false, isRunning: false },
          };
          break;
        default:
          console.error(`Unknown node type on drag & drop: ${type}`);
          return;
      }

      setNodes((prevNodes) => prevNodes.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes],
  );
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      colorMode="dark"
    >
      <Background variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}
