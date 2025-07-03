import type { Setter } from "jotai";
import type { Getter } from "jotai";
import type {
  AppNode,
  AppEdge,
  TextEditorNodeType,
  ImageNodeType,
  SpeechNodeType,
} from "~/Types/nodes";
import {
  edgesAtom,
  isExecutingNodeAtom,
  nodesAtom,
  updateNodeDataAtom,
  executionProgressAtom,
  currentWhiteboardIdAtom,
} from "./atoms";
import type { Id } from "convex/_generated/dataModel";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper functions
function getConnectedSourceNodes(get: Getter, targetNodeId: string) {
  const allNodes = get(nodesAtom);
  const incomingConnections = get(edgesAtom).filter(
    (edge) => edge.target === targetNodeId,
  );

  return allNodes.filter((node) =>
    incomingConnections.some((connection) => connection.source === node.id),
  );
}

function validateWhiteboardId(get: Getter): Id<"whiteboards"> {
  const whiteboardId = get(currentWhiteboardIdAtom);
  if (!whiteboardId) {
    throw new Error("whiteboardId not set");
  }
  return whiteboardId as Id<"whiteboards">;
}

function isNodeExecutable(node: AppNode): boolean {
  return (
    !node.data.isLocked && !("isRunning" in node.data && node.data.isRunning)
  );
}

function isNodeRateLimited(node: ImageNodeType | SpeechNodeType): boolean {
  return node.data.internal?.isRateLimited ?? false;
}

// Node execution implementations
function executeTextNode(
  get: Getter,
  set: Setter,
  thisNode: TextEditorNodeType,
  nextNode: AppNode,
) {
  console.groupCollapsed(
    `executeTextNode: Passing data from node ${thisNode.id} to node ${nextNode.id} (type: ${nextNode.type})`,
  );

  try {
    switch (nextNode.type) {
      case "textEditor":
        set(updateNodeDataAtom, {
          nodeId: nextNode.id,
          updatedData: { text: thisNode.data.text },
          nodeType: nextNode.type,
        });
        break;
      case "image":
      case "speech":
        // These nodes will get text from sourceNodes
        break;
      default:
        throw new Error(
          `Unhandled node type in executeTextNode: ${nextNode.type}`,
        );
    }
  } finally {
    console.groupEnd();
  }
}

async function executeImageNode(
  get: Getter,
  set: Setter,
  currentNode: ImageNodeType,
  _targetNode: AppNode,
) {
  console.groupCollapsed(
    `executeImageNode: Executing image node ${currentNode.id}`,
  );

  try {
    const whiteboardId = validateWhiteboardId(get);

    if (isNodeRateLimited(currentNode)) {
      console.log("Node cannot run: rate limit reached");
      return;
    }

    if (!currentNode.data.internal?.generateAndStoreImageAction) {
      throw new Error("generateAndStoreImageAction not defined.");
    }

    console.log("Running an image node...");

    const connectedSourceNodes = getConnectedSourceNodes(get, currentNode.id);
    const sourceNodes = connectedSourceNodes
      .filter(
        (node): node is TextEditorNodeType | ImageNodeType =>
          node.type === "image" || node.type === "textEditor",
      )
      .map((node) => {
        const { type, id, data } = node;
        return { type, id, data } as typeof node;
      });

    console.log("Running generateAndStoreImageAction");
    await currentNode.data.internal.generateAndStoreImageAction({
      nodeId: currentNode.id,
      sourceNodes,
      whiteboardId,
    });
  } finally {
    console.groupEnd();
  }
}

async function executeSpeechNode(
  get: Getter,
  set: Setter,
  currentNode: SpeechNodeType,
  _targetNode: AppNode,
) {
  console.groupCollapsed(
    `executeSpeechNode: Executing speech node ${currentNode.id}`,
  );

  try {
    const whiteboardId = validateWhiteboardId(get);

    if (isNodeRateLimited(currentNode)) {
      console.log("Node cannot run: rate limit reached");
      return;
    }

    if (!currentNode.data.internal?.generateAndStoreSpeechAction) {
      throw new Error("generateAndStoreSpeechAction not defined.");
    }

    const connectedSourceNodes = getConnectedSourceNodes(get, currentNode.id);
    const sourceNodes = connectedSourceNodes
      .filter((node): node is TextEditorNodeType => node.type === "textEditor")
      .map((node) => {
        const { type, id, data } = node;
        return { type, id, data } as typeof node;
      });

    console.log("Running generateAndStoreSpeechAction");
    await currentNode.data.internal.generateAndStoreSpeechAction({
      nodeId: currentNode.id,
      sourceNodes,
      whiteboardId,
    });
  } catch (error) {
    console.error("Error executing speech node:", error);
  } finally {
    console.groupEnd();
  }
}

// Progress tracking
function initializeExecutionProgress(
  get: Getter,
  set: Setter,
  startNodeId: string,
) {
  const allNodes = get(nodesAtom);
  const allEdges = get(edgesAtom);
  const totalNodes = calculateTotalNodesToExecute(
    allNodes,
    allEdges,
    startNodeId,
  );

  set(executionProgressAtom, {
    isExecuting: true,
    totalNodesForExecution: totalNodes,
    executedNodesCount: 0,
  });
}

function updateExecutionProgress(get: Getter, set: Setter) {
  const progress = get(executionProgressAtom);
  set(executionProgressAtom, {
    ...progress,
    executedNodesCount: progress.executedNodesCount + 1,
  });
}

function finalizeExecutionProgress(
  get: Getter,
  set: Setter,
  visited: Set<string>,
) {
  const progress = get(executionProgressAtom);
  if (visited.size === progress.totalNodesForExecution) {
    set(executionProgressAtom, {
      isExecuting: false,
      totalNodesForExecution: 0,
      executedNodesCount: 0,
    });
  }
}

function calculateTotalNodesToExecute(
  nodes: AppNode[],
  edges: AppEdge[],
  startNodeId: string,
  visited: Set<string> = new Set<string>(),
): number {
  if (visited.has(startNodeId)) return 0;
  visited.add(startNodeId);

  const node = nodes.find((n) => n.id === startNodeId);
  if (!node || node.data.isLocked) return 0;

  const outgoingEdges = edges.filter((edge) => edge.source === startNodeId);
  let totalNodes = 1;

  for (const edge of outgoingEdges) {
    totalNodes += calculateTotalNodesToExecute(
      nodes,
      edges,
      edge.target,
      visited,
    );
  }

  return totalNodes;
}

// Node state management
function setNodeRunning(
  set: Setter,
  nodeId: string,
  nodeType: AppNode["type"],
  isRunning: boolean,
) {
  set(updateNodeDataAtom, {
    nodeId,
    updatedData: { isRunning },
    nodeType,
  });
}

// Main execution logic
async function executeCurrentNode(get: Getter, set: Setter, node: AppNode) {
  console.log(`Detected ${node.type} node. Waiting 1 second before executing.`);
  await delay(1000);

  switch (node.type) {
    case "image":
      await executeImageNode(get, set, node, {} as AppNode);
      break;
    case "speech":
      await executeSpeechNode(get, set, node, {} as AppNode);
      break;
    default:
      throw new Error(`No executor found for node type: ${node.type}`);
  }
}

async function processOutgoingEdges(
  get: Getter,
  set: Setter,
  currentNode: AppNode,
  visited: Set<string>,
) {
  const allNodes = get(nodesAtom);
  const allEdges = get(edgesAtom);
  const outgoingEdges = allEdges.filter(
    (edge) => edge.source === currentNode.id,
  );

  console.log("Outgoing edges:", outgoingEdges);

  for (const edge of outgoingEdges) {
    console.groupCollapsed(
      `Processing edge from node ${currentNode.id} to ${edge.target}`,
    );

    try {
      const nextNode = allNodes.find((n) => n.id === edge.target);
      if (!nextNode) {
        console.warn("Next node not found for edge:", edge);
        continue;
      }

      if (!isNodeExecutable(nextNode)) {
        console.warn("Next node is not executable:", nextNode);
        continue;
      }

      // Handle data passing for text nodes
      if (currentNode.type === "textEditor") {
        console.log(
          "Executing text node logic: passing text from",
          currentNode.id,
          "to",
          nextNode.id,
        );
        executeTextNode(get, set, currentNode, nextNode);
      }

      console.log(
        "Recursively executing node logic for next node:",
        nextNode.id,
      );
      await executeNodeLogic(get, set, nextNode.id, visited);
    } finally {
      console.groupEnd();
    }
  }
}

export async function executeNodeLogic(
  get: Getter,
  set: Setter,
  nodeId: string,
  visited: Set<string> = new Set<string>(),
) {
  console.groupCollapsed(`executeNodeLogic: Executing node ${nodeId}`);

  try {
    // Initialize progress tracking on first call
    if (visited.size === 0) {
      initializeExecutionProgress(get, set, nodeId);
    }

    // Skip if already visited
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    // Get and validate current node
    const allNodes = get(nodesAtom);
    const currentNode = allNodes.find((n) => n.id === nodeId);

    if (!currentNode || !isNodeExecutable(currentNode)) {
      console.warn("Node is not executable:", currentNode);
      return;
    }

    try {
      // Set node as running and update progress
      setNodeRunning(set, nodeId, currentNode.type, true);
      set(isExecutingNodeAtom, true);
      updateExecutionProgress(get, set);

      // Execute the current node if it's an image or speech node
      if (currentNode.type === "image" || currentNode.type === "speech") {
        await executeCurrentNode(get, set, currentNode);
      }

      // Process outgoing edges and continue execution
      await processOutgoingEdges(get, set, currentNode, visited);
    } finally {
      // Always reset node running state
      setNodeRunning(set, nodeId, currentNode.type, false);

      // Finalize progress if this was the last node
      finalizeExecutionProgress(get, set, visited);
    }
  } finally {
    console.groupEnd();
  }
}
