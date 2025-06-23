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
import { edgeTypes, nodeTypes } from "./config";
import type { AppEdge, AppNode } from "~/Types/nodes";
import { edgesAtom, isExecutingNodeAtom, nodesAtom } from "./atoms";
import { useAtom } from "jotai";
import { useDnD } from "./DnDContext";
import { v4 as uuidv4 } from "uuid";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { debounce } from "lodash";
import Loading from "../loading";
import SharingPopup from "./SharingPopup";

type Props = {
  id: Id<"whiteboards">;
};

function checkIfNodeExists(nodes: AppNode[], nodeId: string) {
  return nodes.some((node) => node.id === nodeId);
}

export default function Whiteboard({ id }: Props) {
  const whiteboardData = useQuery(
    api.whiteboards.getWhiteboard,
    id ? { id } : "skip",
  );
  const user = useQuery(api.users.current);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [isExecuting] = useAtom(isExecutingNodeAtom);
  const [dndType] = useDnD();
  const { screenToFlowPosition } = useReactFlow();

  const updateContentMutation = useMutation(api.whiteboards.editWhiteboard);
  const initialLoadDone = useRef(false);

  // Check if this is a shared whiteboard
  const isSharedWhiteboard =
    whiteboardData?.isPublic && whiteboardData?.ownerId !== user?.externalId;

  // Load whiteboard data from Convex into Jotai atoms
  useEffect(() => {
    // If whiteboardData.isPublic && whiteboardData.ownerId !== user.externalId; then this is a shared whiteboard
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
      console.groupCollapsed("Debounced Save");
      if (!id || !initialLoadDone.current) {
        console.log("Skipping save: not initialized or no id");
        console.groupEnd();
        return;
      }
      if (isExecuting) {
        console.warn("Skipping save: a node is currently executing");
        console.groupEnd();
        return;
      }

      console.log("Starting save process...");
      console.log(
        `Preparing to save ${currentNodes.length} nodes and ${currentEdges.length} edges`,
      );

      console.time("Preparation time");
      const nodesToSave = currentNodes.map((n) => {
        if (n.type === "image") {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { internal, ...nodeDataWithoutInternal } = n.data;
          return {
            id: n.id,
            type: n.type,
            position: n.position,
            data: nodeDataWithoutInternal,
            zIndex: n.zIndex,
          };
        }
        if (n.type === "comment") {
          return {
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
            width: n.width,
            height: n.height,
            zIndex: n.zIndex,
          };
        }
        return {
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
          zIndex: n.zIndex,
        };
      });

      const edgesToSave = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.animated,
        type: e.type,
      }));
      console.timeEnd("Preparation time");

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
      } finally {
        console.groupEnd();
      }
    }, 500),
  );

  // Keep track of the last saved state for nodes and edges
  const lastSavedRef = useRef<{ nodes: AppNode[]; edges: AppEdge[] } | null>(
    null,
  );

  // Effect to save changes when nodes or edges atoms are updated
  useEffect(() => {
    if (!initialLoadDone.current || !whiteboardData || isSharedWhiteboard) {
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
  }, [nodes, edges, whiteboardData, isSharedWhiteboard]);

  useEffect(() => {
    console.groupCollapsed("Edge Check");
    console.time("Edge Check");
    for (const edge of edges) {
      // Check if both source and target nodes exist, if not, remove the edge
      const sourceNodeExists = checkIfNodeExists(nodes, edge.source);
      const targetNodeExists = checkIfNodeExists(nodes, edge.target);

      if (!sourceNodeExists || !targetNodeExists) {
        console.log("Removing edge with id:", edge.id);
        setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edge.id));
      }
    }
    console.timeEnd("Edge Check");
    console.groupEnd();
  }, [edges, setEdges, nodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange<AppNode>[]) => {
      if (isSharedWhiteboard) return; // Disable node changes for shared whiteboard

      // Handle z-index changes
      const updatedNodes = applyNodeChanges(changes, nodes);

      // Update z-indices based on selection
      const selectedNodes = updatedNodes.filter((node) => node.selected);
      if (selectedNodes.length > 0) {
        const maxZIndex = Math.max(
          ...updatedNodes.map((node) => node.zIndex ?? 0),
        );
        const updatedNodesWithZIndex = updatedNodes.map((node) => {
          if (node.selected) {
            return { ...node, zIndex: maxZIndex + 1 };
          }
          return node;
        });
        setNodes(updatedNodesWithZIndex);
      } else {
        setNodes(updatedNodes);
      }
    },
    [setNodes, isSharedWhiteboard, nodes],
  );

  // Add keyboard shortcut handler for z-index manipulation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSharedWhiteboard) return; // Disable keyboard shortcuts for shared whiteboard

      const selectedNodes = nodes.filter((node) => node.selected);
      if (selectedNodes.length === 0) return;

      if (event.key === "[" || event.key === "]") {
        event.preventDefault();
        const direction = event.key === "[" ? -1 : 1;

        setNodes((prevNodes) => {
          const maxZIndex = Math.max(
            ...prevNodes.map((node) => node.zIndex ?? 0),
          );
          const minZIndex = Math.min(
            ...prevNodes.map((node) => node.zIndex ?? 0),
          );

          return prevNodes.map((node) => {
            if (node.selected) {
              const newZIndex = (node.zIndex ?? 0) + direction;
              // Keep z-index within bounds
              return {
                ...node,
                zIndex: Math.max(minZIndex, Math.min(maxZIndex + 1, newZIndex)),
              };
            }
            return node;
          });
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, setNodes, isSharedWhiteboard]);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (isSharedWhiteboard) return; // Disable edge changes for shared whiteboard
      setEdges((eds) =>
        applyEdgeChanges(changes, eds).map((e) => ({ ...e, type: "default" })),
      );
    },
    [setEdges, isSharedWhiteboard],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (isSharedWhiteboard) return; // Disable connections for shared whiteboard
      // Prevent connecting a node to itself
      if (connection.source === connection.target) return;
      setEdges((eds) =>
        addEdge({ ...connection, id: uuidv4(), type: "default" }, eds),
      );
    },
    [setEdges, isSharedWhiteboard],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (isSharedWhiteboard) return; // Disable dropping for shared whiteboard
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
        case "comment":
          newNode = {
            id: newNodeId,
            type: dndType,
            position,
            data: {
              isLocked: false,
              text: "",
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
    [screenToFlowPosition, dndType, setNodes, isSharedWhiteboard],
  );

  const onDragOver = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      if (isSharedWhiteboard) return; // Disable drag over for shared whiteboard
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [isSharedWhiteboard],
  );

  if (id && whiteboardData === undefined) {
    return <Loading />;
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
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{
        padding: 0.9, // leave 90% margin -> zooms out further
      }}
      colorMode="dark"
      proOptions={{
        hideAttribution: true, // Remove "React flow" watermark
      }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <SharingPopup id={id} />
    </ReactFlow>
  );
}
