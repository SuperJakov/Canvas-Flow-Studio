"use client";
import { type DragEvent, useEffect, useRef, useState } from "react";
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
import type { Id } from "../../../convex/_generated/dataModel";
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
  id: Id<"whiteboards">;
};

function checkIfNodeExists(nodes: AppNode[], nodeId: string) {
  return nodes.some((node) => node.id === nodeId);
}

function stripInternal(node: AppNode) {
  if ("internal" in node.data) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { internal, ...nodeDataWithoutInternal } = node.data;
    return { ...node, data: nodeDataWithoutInternal };
  }
  return { ...node };
}

function normalizeZIndices(nodes: AppNode[]) {
  // time O(n), space O(n)
  const maxZIndex = Math.max(...nodes.map((node) => node.zIndex ?? 0));
  return nodes.map((node) => {
    if (node.selected) {
      return { ...node, zIndex: maxZIndex + 1 };
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

  // Check if this is a shared whiteboard
  const isSharedWhiteboard =
    whiteboardData?.isPublic && whiteboardData?.ownerId !== user?.externalId;

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
      const nodesToSave = currentNodes.map((n) => {
        const node = stripInternal(n);
        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
          zIndex: node.zIndex,
        } as AppNode;
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
    const hasNodesChanged = !deepEqual(nodes, lastSavedRef.current?.nodes);
    const hasEdgesChanged = !deepEqual(edges, lastSavedRef.current?.edges);

    if (hasNodesChanged || hasEdgesChanged) {
      void debouncedSaveRef.current(nodes, edges);
      lastSavedRef.current = { nodes, edges };
    }
  }, [nodes, edges, whiteboardData, isSharedWhiteboard]);

  useEffect(() => {
    for (const edge of edges) {
      // Check if both source and target nodes exist, if not, remove the edge
      const sourceNodeExists = checkIfNodeExists(nodes, edge.source);
      const targetNodeExists = checkIfNodeExists(nodes, edge.target);

      if (!sourceNodeExists || !targetNodeExists) {
        console.log("[Edge check] Removing edge with id:", edge.id);
        setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edge.id));
      }
    }
  }, [edges, setEdges, nodes]);

  const onNodesChange = (changes: NodeChange<AppNode>[]) => {
    if (isSharedWhiteboard) return; // Disable node changes for shared whiteboard

    // Handle z-index changes
    const updatedNodes = applyNodeChanges(changes, nodes);

    // Update z-indices based on selection
    const selectedNodes = updatedNodes.filter((node) => node.selected);
    if (selectedNodes.length > 0) {
      setNodes(normalizeZIndices(updatedNodes));
      return;
    }
    setNodes(updatedNodes);
  };

  // Add keyboard shortcut handler for z-index manipulation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSharedWhiteboard) return; // Disable keyboard shortcuts for shared whiteboard

      const selectedNodes = nodes.filter((node) => node.selected);
      if (selectedNodes.length === 0) return;

      if (event.key === "[" || event.key === "]") {
        event.preventDefault();
        const moveUp = event.key === "]";

        console.groupCollapsed(`Z-Index ${moveUp ? "Up" : "Down"} Operation`);
        console.log(
          "Before move:",
          nodes.map((n) => ({
            id: n.id,
            zIndex: n.zIndex,
            selected: n.selected,
          })),
        );

        setNodes((prevNodes) => {
          // Sort nodes by zIndex ascending
          const sorted = [...prevNodes].sort(
            (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
          );
          // Get selected node ids
          const selectedIds = new Set(selectedNodes.map((n) => n.id));

          // Find the indices of selected nodes in sorted order
          const selectedIndices = sorted
            .map((node, idx) => (selectedIds.has(node.id) ? idx : -1))
            .filter((idx) => idx !== -1);

          if (selectedIndices.length === 0) {
            console.log("No selected nodes to move.");
            console.groupEnd();
            return prevNodes;
          }

          // If moving down ([), process from lowest to highest; if up (]), process from highest to lowest
          const indicesToProcess = moveUp
            ? [...selectedIndices].reverse()
            : selectedIndices;

          for (const idx of indicesToProcess) {
            const node = sorted[idx];
            const swapIdx = moveUp ? idx + 1 : idx - 1;
            if (swapIdx < 0 || swapIdx >= sorted.length) continue; // Already at edge
            const swapNode = sorted[swapIdx];
            if (!node || !swapNode) continue;
            // Don't swap with another selected node
            if (selectedIds.has(swapNode.id)) continue;
            // Swap z-indices
            console.log(
              `Swapping node ${node.id} (z: ${node.zIndex}) with node ${swapNode.id} (z: ${swapNode.zIndex})`,
            );
            const temp = swapNode.zIndex ?? 0;
            swapNode.zIndex = node.zIndex ?? 0;
            node.zIndex = temp;
          }

          // Return nodes in original order, but with updated z-indices
          const idToZ = Object.fromEntries(sorted.map((n) => [n.id, n.zIndex]));
          const afterMove = prevNodes.map((node) => ({
            id: node.id,
            zIndex: idToZ[node.id],
            selected: node.selected,
          }));
          console.log("After move:", afterMove);
          console.groupEnd();
          return prevNodes.map((node) => ({ ...node, zIndex: idToZ[node.id] }));
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, setNodes, isSharedWhiteboard]);

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

    switch (dndType) {
      case "textEditor":
        newNode = {
          id: newNodeId,
          type: dndType,
          position,
          data: { text: "", isLocked: false, internal: { isRunning: false } },
          width: 280,
          height: 180,
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
      <div className="flex h-screen w-full items-center justify-center bg-gray-800 text-white">
        Whiteboard not found or access denied.
        <Link href="/whiteboards" className="underline">
          Go to whiteboards page to create a new one.
        </Link>
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
