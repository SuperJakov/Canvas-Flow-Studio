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
import type { Id } from "convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

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
  // Memoize the debounced save function
  const debouncedSave = useCallback(
    (currentNodes: AppNode[], currentEdges: AppEdge[]) => {
      const save = debounce(async () => {
        if (!id || !initialLoadDone.current) {
          console.log("Skipping save: not initialized or no id");
          return;
        }

        console.log("Starting save process...");
        console.log(
          `Preparing to save ${currentNodes.length} nodes and ${currentEdges.length} edges`,
        );

        const nodesToSave = currentNodes
          .filter(
            (n): n is AppNode & { type: string } => typeof n.type === "string",
          )
          .map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
          }));

        const edgesToSave = currentEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: e.animated,
        }));

        console.log(
          "Filtered nodes:",
          nodesToSave.length,
          "Filtered edges:",
          edgesToSave.length,
        );

        try {
          console.time("Save operation");
          await updateContentMutation({
            id,
            nodes: nodesToSave,
            edges: edgesToSave,
          });
          console.timeEnd("Save operation");
          console.log("✅ Save completed successfully");
        } catch (error) {
          console.error("❌ Failed to save whiteboard content:", error);
        }
      }, 500);

      save();
    },
    [id, updateContentMutation],
  );

  // Keep track of the last saved state
  const lastSavedRef = useRef<{ nodes: AppNode[]; edges: AppEdge[] } | null>(
    null,
  );

  // Effect to save changes when nodes or edges atoms are updated
  useEffect(() => {
    if (!initialLoadDone.current || !whiteboardData) {
      console.log(
        "Skipping save effect: initial load not done or no whiteboard data",
      );
      return;
    }

    // Initialize lastSavedRef if it hasn't been set yet
    if (lastSavedRef.current === null) {
      console.log("Initializing lastSavedRef with current data");
      lastSavedRef.current = {
        nodes: nodes,
        edges: edges,
      };
      // Don't return here - we want to save the initial state
    }

    // Check if nodes or edges have actually changed from what's saved
    const hasNodesChanged =
      JSON.stringify(nodes) !== JSON.stringify(lastSavedRef.current?.nodes);
    const hasEdgesChanged =
      JSON.stringify(edges) !== JSON.stringify(lastSavedRef.current?.edges);

    console.log("Checking for changes:", { hasNodesChanged, hasEdgesChanged });

    if (hasNodesChanged || hasEdgesChanged) {
      console.log(
        "Detected changes in nodes or edges, triggering debouncedSave",
      );
      debouncedSave(nodes, edges);
      // Update last saved state
      lastSavedRef.current = { nodes, edges };
    } else {
      console.log("No changes detected, not saving");
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
        <Loader2 className="mr-2 animate-spin" size={40} />
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
