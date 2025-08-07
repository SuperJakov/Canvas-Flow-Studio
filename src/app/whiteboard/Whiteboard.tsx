"use client";
import { type DragEvent, useEffect, useMemo, useRef, useState } from "react";
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
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { debounce } from "lodash";
import Loading from "../loading";
import SharingPopup from "./SharingPopup";
import WhiteboardPreviewCreator from "./WhiteboardPreviewCreator";
import Portal from "../_components/Portal";
import UpgradeBanner from "./UpgradeBanner";
import { useConvexQuery } from "~/helpers/convex";
import { deepEqual } from "fast-equals";

type Props = {
  id: string;
};

function stripInternal<T extends AppNode>(node: T): T {
  if ("internal" in node.data) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internal, ...nodeDataWithoutInternal } = node.data;
    return { ...node, data: nodeDataWithoutInternal } as T;
  }
  return node;
}

function stripNodeForDb<T extends AppNode>(node: T): T {
  const common = {
    id: node.id,
    type: node.type,
    data: node.data,
    position: node.position,
    zIndex: node.zIndex,
  } as const;

  // Only include width/height for nodes that are resizable
  if (node.type === "textEditor" || node.type === "comment") {
    const nodeWithDimensions = node as Extract<
      T,
      { width?: number; height?: number }
    >;
    return {
      ...common,
      ...(nodeWithDimensions.width !== undefined && {
        width: nodeWithDimensions.width,
      }),
      ...(nodeWithDimensions.height !== undefined && {
        height: nodeWithDimensions.height,
      }),
    } as T;
  }

  return common as T;
}

function bringSelectedNodesToFront(nodes: AppNode[]): AppNode[] {
  const selectedNodes = nodes.filter((node) => node.selected);

  // If no nodes are selected, return as-is
  if (selectedNodes.length === 0) {
    return nodes;
  }

  // Find the current maximum z-index
  // const maxZIndex = Math.max(0, ...nodes.map((node) => node.zIndex ?? 0));

  // Only update selected nodes that don't already have the highest z-indices
  const selectedIds = new Set(selectedNodes.map((n) => n.id));
  const highestZIndices = nodes
    .filter((n) => !selectedIds.has(n.id))
    .map((n) => n.zIndex ?? 0)
    .sort((a, b) => b - a);

  const minRequiredZIndex =
    highestZIndices.length > 0 ? Math.max(...highestZIndices) + 1 : 1;

  // Check if selected nodes already have higher z-indices than unselected
  const needsUpdate = selectedNodes.some(
    (node) => (node.zIndex ?? 0) < minRequiredZIndex,
  );

  if (!needsUpdate) {
    return nodes;
  }

  // Update only the selected nodes that need higher z-indices
  return nodes.map((node) => {
    if (node.selected) {
      const currentIndex = selectedNodes.findIndex((n) => n.id === node.id);
      return {
        ...node,
        zIndex: minRequiredZIndex + currentIndex,
      };
    }
    return node;
  });
}

export default function Whiteboard({ id }: Props) {
  const whiteboardData = useConvexQuery(
    api.whiteboards.getWhiteboard,
    id ? { id } : "skip",
  );
  const nodeCountLimit = useConvexQuery(api.whiteboards.getNodeCountLimit);
  const user = useConvexQuery(api.users.current);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [isExecuting] = useAtom(isExecutingNodeAtom);
  const [dndType] = useDnD();
  const { screenToFlowPosition } = useReactFlow();

  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [bannerFeature, setBannerFeature] = useState("");

  const updateContentMutation = useMutation(api.whiteboards.editWhiteboard);
  const initialLoadDone = useRef(false);

  console.log(JSON.stringify(nodes));
  console.log(JSON.stringify(edges));

  // Check if this is a shared whiteboard
  const isSharedWhiteboard =
    whiteboardData?.isPublic && whiteboardData?.ownerId !== user?.externalId;

  // console.log(JSON.stringify(nodes));
  // console.log(JSON.stringify(edges));

  // Load whiteboard data from Convex into Jotai atoms
  useEffect(() => {
    if (whiteboardData && !initialLoadDone.current) {
      console.groupCollapsed("[Whiteboard] Loading whiteboard data into atoms");
      console.log("Loading whiteboard data into atoms:", whiteboardData);
      setNodes(whiteboardData.nodes);
      setEdges(whiteboardData.edges);
      initialLoadDone.current = true;
      console.groupEnd();
    } else if (whiteboardData === null && id && !initialLoadDone.current) {
      console.groupCollapsed(
        `[Whiteboard] Whiteboard ${id} not found or access denied. Clearing local state.`,
      );
      console.warn(
        `Whiteboard ${id} not found or access denied. Clearing local state.`,
      );
      setNodes([]);
      setEdges([]);
      initialLoadDone.current = true;
      console.groupEnd();
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

      const nodesToSave = currentNodes.map((n) =>
        stripNodeForDb(stripInternal(n)),
      );

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
    const hasNodesChanged = !deepEqual(nodes, lastSavedRef.current?.nodes);
    const hasEdgesChanged = !deepEqual(edges, lastSavedRef.current?.edges);

    if (hasNodesChanged || hasEdgesChanged) {
      void debouncedSaveRef.current(nodes, edges);
      lastSavedRef.current = { nodes, edges };
    }
  }, [nodes, edges, whiteboardData, isSharedWhiteboard]);

  const nodeIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  useEffect(() => {
    const orphanedEdges = edges.filter(
      (edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target),
    );

    if (orphanedEdges.length > 0) {
      console.log("Removing orphan edge...");
      setEdges((prev) =>
        prev.filter(
          (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
        ),
      );
    }
  }, [nodeIds, edges, setEdges]);

  const onNodesChange = (changes: NodeChange<AppNode>[]) => {
    if (isSharedWhiteboard) return; // Disable node changes for shared whiteboard

    // Apply the node changes first
    const updatedNodes = applyNodeChanges(changes, nodes);

    // Only bring selected nodes to front if there are selection changes
    const hasSelectionChanges = changes.some(
      (change) => change.type === "select",
    );

    if (hasSelectionChanges) {
      const nodesWithUpdatedZIndex = bringSelectedNodesToFront(updatedNodes);
      setNodes(nodesWithUpdatedZIndex);
    } else {
      setNodes(updatedNodes);
    }
  };

  // Sharing
  useEffect(() => {
    if (!isSharedWhiteboard) return;
    // Subscribe to real updates if this is a shared whiteboard
    setNodes(whiteboardData.nodes);
    setEdges(whiteboardData.edges);
  }, [isSharedWhiteboard, setEdges, setNodes, whiteboardData]);

  const onEdgesChange = (changes: EdgeChange[]) => {
    if (isSharedWhiteboard) return; // Disable edge changes for shared whiteboard
    setEdges((eds) =>
      applyEdgeChanges(changes, eds).map((e) => ({ ...e, type: "default" })),
    );
  };

  const onConnect = (connection: Connection) => {
    if (isSharedWhiteboard) return; // Disable connections for shared whiteboard
    // Prevent connecting a node to itself
    if (connection.source === connection.target) return;
    setEdges((eds) =>
      addEdge({ ...connection, id: uuidv4(), type: "default" }, eds),
    );
  };

  const openBanner = (feature: string) => {
    setBannerFeature(feature);
    setIsBannerOpen(true);
  };

  const closeBanner = () => {
    setIsBannerOpen(false);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dndType) return;
    if (isSharedWhiteboard) return; // Disable dropping for shared whiteboard
    if (!nodeCountLimit?.maxNodeCount) return;

    if (nodeCountLimit.maxNodeCount < nodes.length + 1)
      return openBanner("Higher limits");
    console.log(nodeCountLimit.maxNodeCount);
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    let newNode: AppNode | undefined;
    const newNodeId = uuidv4();

    // Calculate the highest z-index + 1 for the new node
    const maxZIndex = Math.max(0, ...nodes.map((node) => node.zIndex ?? 0));
    const newZIndex = maxZIndex + 1;

    switch (dndType) {
      case "textEditor":
        newNode = {
          id: newNodeId,
          type: dndType,
          position,
          data: { text: "", isLocked: false, internal: { isRunning: false } },
          width: 280,
          height: 180,
          zIndex: newZIndex,
        };
        break;
      case "image":
        newNode = {
          id: newNodeId,
          type: dndType,
          position,
          data: {
            isLocked: false,
            imageUrl: null,
            internal: {
              isRunning: false,
            },
            style: "auto",
          },
          zIndex: newZIndex,
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
          zIndex: newZIndex,
        };
        break;
      case "speech":
        newNode = {
          id: newNodeId,
          type: dndType,
          position,
          data: {
            isLocked: false,
            internal: {
              isRunning: false,
            },
          },
          zIndex: newZIndex,
        };
        break;
      case "instruction":
        newNode = {
          id: newNodeId,
          type: dndType,
          position,
          data: {
            isLocked: false,
            text: "",
            internal: {
              isRunning: false,
            },
          },
          zIndex: newZIndex,
        };
        break;
      default:
        console.error(`Unknown node type on drag & drop: ${dndType}`);
        return;
    }
    if (newNode) {
      setNodes((prevNodes) => prevNodes.concat(newNode));
    }
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (isSharedWhiteboard) return; // Disable drag over for shared whiteboard
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  if (id && whiteboardData === undefined) {
    return <Loading />;
  }
  if (id && whiteboardData === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>
          Whiteboard not found or access denied.{" "}
          <Link href="/whiteboards" className="underline">
            Go to whiteboards page to create a new one.
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <Portal>
        <UpgradeBanner
          isOpen={isBannerOpen}
          onCloseAction={closeBanner}
          featureName={bannerFeature}
        />
      </Portal>
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
        <WhiteboardPreviewCreator id={id} />
      </ReactFlow>
    </>
  );
}
