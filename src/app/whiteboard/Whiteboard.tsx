"use client";
import { useCallback, type DragEvent, useEffect, useRef } from "react";
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
import type { AppEdge, AppNode } from "~/Types/nodes"; // Ensure this path is correct
import { edgesAtom, nodesAtom } from "./atoms"; // Ensure this path is correct
import { useAtom } from "jotai";
import { useDnD } from "./DnDContext"; // Ensure this path is correct
import { v4 as uuidv4 } from "uuid";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id, Doc } from "convex/_generated/dataModel";

// Simple debounce utility
function debounce<Args extends unknown[]>(
  func: (...args: Args) => unknown, // The function to debounce. Its return type isn't used by the debounced wrapper.
  waitFor: number,
): (...args: Args) => void {
  // The debounced function will always return void.
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Args): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null; // Optional: Reset timeout variable after clearing
    }
    timeout = setTimeout(() => {
      func(...args); // Call the original function. Its actual return value is effectively ignored here.
    }, waitFor);
  };

  return debounced;
}

type Props = {
  id: Id<"whiteboards">;
};

export default function Whiteboard({ id }: Props) {
  const whiteboardData = useQuery(
    api.whiteboards.getWhiteboard,
    id ? { id } : "skip",
  );
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [dndType] = useDnD(); // Renamed to avoid conflict with node 'type'
  const { screenToFlowPosition } = useReactFlow();

  const updateContentMutation = useMutation(api.whiteboards.editWhiteboard);

  const initialLoadDone = useRef(false); // To prevent saving before initial load

  // Load whiteboard data from Convex into Jotai atoms
  useEffect(() => {
    if (whiteboardData && !initialLoadDone.current) {
      console.log("Loading whiteboard data into atoms:", whiteboardData);
      // Ensure the fetched data structure matches AppNode[] and AppEdge[]
      // You might need to cast or transform if types differ subtly
      setNodes(whiteboardData.nodes as AppNode[]);
      setEdges(whiteboardData.edges as AppEdge[]);
      initialLoadDone.current = true;
    } else if (whiteboardData === null && id && !initialLoadDone.current) {
      // Whiteboard not found or not authorized, clear local state
      console.warn(
        `Whiteboard ${id} not found or access denied. Clearing local state.`,
      );
      setNodes([]);
      setEdges([]);
      initialLoadDone.current = true; // Mark as loaded to prevent further attempts
      // Consider redirecting or showing an error message here
    }
  }, [whiteboardData, setNodes, setEdges, id]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (currentNodes: AppNode[], currentEdges: AppEdge[]) => {
      if (!id || !initialLoadDone.current || !whiteboardData) {
        // Don't save if no ID, initial load not done, or original data wasn't loaded (e.g. not found)
        return;
      }

      // Ensure nodes and edges are in the format Convex expects.
      // Only save nodes with a defined type.
      const nodesToSave = currentNodes
        .filter(
          (n): n is AppNode & { type: string } => typeof n.type === "string",
        )
        .map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data /*, width: n.width, height: n.height*/,
        }));
      const edgesToSave = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        animated: e.animated,
      }));

      console.log("Attempting to save whiteboard content:", {
        id,
        nodes: nodesToSave,
        edges: edgesToSave,
      });
      try {
        await updateContentMutation({
          id,
          nodes: nodesToSave,
          edges: edgesToSave,
        });
        console.log("Whiteboard content saved successfully.");
      } catch (error) {
        console.error("Failed to save whiteboard content:", error);
        // Optionally, notify the user (e.g., with a toast)
      }
    }, 1500), // Save 1.5 seconds after the last change
    [id, updateContentMutation, whiteboardData], // Add whiteboardData to dependencies
  );

  // Effect to save changes when nodes or edges atoms are updated
  useEffect(() => {
    if (initialLoadDone.current && whiteboardData) {
      // Only save if loaded and data was present
      debouncedSave(nodes, edges);
    }
  }, [nodes, edges, debouncedSave, whiteboardData]);

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, id: uuidv4() }, eds)); // Ensure new edges get unique IDs
    },
    [setEdges],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!dndType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: AppNode | undefined;
      const newNodeId = uuidv4();

      switch (dndType) {
        case "textEditor":
          newNode = {
            id: newNodeId,
            type: dndType, // Use dndType consistently
            position,
            data: { text: "New Text", isLocked: false, isRunning: false },
          };
          break;
        // Add cases for "imageNode", "instruction", "comment" if they are actual node types
        default:
          console.error(`Unknown node type on drag & drop: ${dndType}`);
          return;
      }
      if (newNode) {
        setNodes((prevNodes) => prevNodes.concat(newNode));
      }
    },
    [screenToFlowPosition, dndType, setNodes],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle loading state for whiteboardData
  if (id && whiteboardData === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-800 text-white">
        Loading whiteboard...
      </div>
    );
  }
  if (id && whiteboardData === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-800 text-white">
        Whiteboard not found or access denied.
      </div>
    );
  }

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
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
    </ReactFlow>
  );
}
