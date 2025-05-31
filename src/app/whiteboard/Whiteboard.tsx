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
import type { AppEdge, AppNode } from "~/Types/nodes";
import { edgesAtom, isExecutingNodeAtom, nodesAtom } from "./atoms";
import { useAtom } from "jotai";
import { useDnD } from "./DnDContext";
import { v4 as uuidv4 } from "uuid";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { debounce } from "lodash";

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
  const [isExecuting] = useAtom(isExecutingNodeAtom);
  const [dndType] = useDnD();
  const { screenToFlowPosition } = useReactFlow();

  const updateContentMutation = useMutation(api.whiteboards.editWhiteboard);
  const initialLoadDone = useRef(false);

  // Load whiteboard data from Convex into Jotai atoms
  useEffect(() => {
    if (whiteboardData && !initialLoadDone.current) {
      console.log("Loading whiteboard data into atoms:", whiteboardData);
      setNodes(whiteboardData.nodes as AppNode[]);
      setEdges(whiteboardData.edges as AppEdge[]);
      initialLoadDone.current = true;
    } else if (whiteboardData === null && id && !initialLoadDone.current) {
      console.warn(
        `Whiteboard ${id} not found or access denied. Clearing local state.`,
      );
      setNodes([]);
      setEdges([]);
      initialLoadDone.current = true;
    }
  }, [whiteboardData, setNodes, setEdges, id]);

  // Persist the debounced save function so it isn't re-created on every render.
  const debouncedSaveRef = useRef(
    debounce(async (currentNodes: AppNode[], currentEdges: AppEdge[]) => {
      if (!id || !initialLoadDone.current) {
        console.log("Skipping save: not initialized or no id");
        return;
      }
      if (isExecuting) {
        console.warn("Skipping save: a node is currently executing");
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
        .map((n) => {
          if (n.type === "image") {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { internal, ...nodeDataWithoutInternal } = n.data;
            return {
              id: n.id,
              type: n.type,
              position: n.position,
              data: nodeDataWithoutInternal,
            };
          }
          return {
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
          };
        });

      const edgesToSave = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      }));

      try {
        console.log("Calling updateContentMutation...");
        console.time("Save operation");
        await updateContentMutation({
          id,
          nodes: nodesToSave,
          edges: edgesToSave,
        });
        console.timeEnd("Save operation");
      } catch (error) {
        console.error("❌ Failed to save whiteboard content:", error);
      }
    }, 500),
  );

  // Keep track of the last saved state for nodes and edges
  const lastSavedRef = useRef<{ nodes: AppNode[]; edges: AppEdge[] } | null>(
    null,
  );

  // Effect to save changes when nodes or edges atoms are updated
  useEffect(() => {
    if (!initialLoadDone.current || !whiteboardData) {
      return;
    }

    // Initialize lastSavedRef if not set yet.
    lastSavedRef.current ??= { nodes, edges };

    const hasNodesChanged =
      JSON.stringify(nodes) !== JSON.stringify(lastSavedRef.current?.nodes);
    const hasEdgesChanged =
      JSON.stringify(edges) !== JSON.stringify(lastSavedRef.current?.edges);

    if (hasNodesChanged || hasEdgesChanged) {
      void debouncedSaveRef.current(nodes, edges);
      lastSavedRef.current = { nodes, edges };
    }
  }, [nodes, edges, whiteboardData]);

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
      setEdges((eds) => addEdge({ ...connection, id: uuidv4() }, eds));
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
            type: dndType,
            position,
            data: { text: "", isLocked: false, isRunning: false },
          };
          break;
        case "image":
          newNode = {
            id: newNodeId,
            type: dndType,
            position,
            data: {
              isLocked: false,
              isRunning: false,
              imageUrl: null,
            },
          };
          break;
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
        <Link href="/whiteboards" className="underline">
          Go to whiteboards page to create a new one.
        </Link>
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
