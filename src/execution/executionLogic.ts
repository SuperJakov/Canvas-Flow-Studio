// src/store/executionLogic.ts

import type { Setter, Getter } from "jotai";
import type {
  AppNode,
  AppEdge,
  TextEditorNodeType,
  ImageNodeType,
  SpeechNodeType,
  InstructionNodeType,
  CommentNodeData,
  InstructionNodeData,
  SpeechNodeData,
  ImageNodeData,
  TextEditorNodeData,
} from "~/Types/nodes";
import {
  edgesAtom,
  isExecutingNodeAtom,
  nodesAtom,
  updateNodeDataAtom,
  executionProgressAtom,
  currentWhiteboardIdAtom,
} from "~/app/whiteboard/atoms";
import { findExecutor } from "~/execution/registry";
import type { ExecutionContext } from "~/execution/types";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getConnectedSourceNodes(get: Getter, targetNodeId: string) {
  const allNodes = get(nodesAtom);
  const incomingConnections = get(edgesAtom).filter(
    (edge) => edge.target === targetNodeId,
  );
  return allNodes.filter((node) =>
    incomingConnections.some((connection) => connection.source === node.id),
  );
}

export function validateWhiteboardId(get: Getter) {
  const whiteboardId = get(currentWhiteboardIdAtom);
  if (!whiteboardId) throw new Error("whiteboardId not set");
  return whiteboardId;
}

export function isNodeExecutable(node: AppNode, edges: AppEdge[]) {
  const hasConnections =
    edges.some((edge) => edge.source === node.id) ||
    edges.some((edge) => edge.target === node.id);
  if (!hasConnections)
    return {
      isExecutable: false,
      reason: "No connections",
    } as const;

  return {
    isExecutable:
      !node.data.isLocked && !("isRunning" in node.data && node.data.isRunning),
  } as const;
}

export function isNodeRateLimited(
  node: ImageNodeType | SpeechNodeType,
): boolean {
  return node.data.internal?.isRateLimited ?? false;
}

export function collectSourceNodes(
  get: Getter,
  targetNodeId: string,
  visited: Set<string> = new Set<string>(),
): (
  | ImageNodeType
  | TextEditorNodeType
  | InstructionNodeType
  | SpeechNodeType
)[] {
  if (visited.has(targetNodeId)) return [];
  visited.add(targetNodeId);
  const directSources = getConnectedSourceNodes(get, targetNodeId);
  const payloadNodes: (
    | ImageNodeType
    | TextEditorNodeType
    | InstructionNodeType
    | SpeechNodeType
  )[] = [];
  for (const node of directSources) {
    switch (node.type) {
      case "image":
      case "textEditor":
      case "speech":
      case "instruction":
        payloadNodes.push(node);
        break;
      default:
        break;
    }
  }
  return payloadNodes;
}

function executeTextNode(
  get: Getter,
  set: Setter,
  thisNode: TextEditorNodeType,
  nextNode: AppNode,
) {
  console.groupCollapsed(
    `Passing data from node ${thisNode.id} to node ${nextNode.id}`,
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
      case "instruction":
      case "website":
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

export function getDefaultNodeData(nodeType: AppNode["type"]) {
  switch (nodeType) {
    case "textEditor":
      return {
        text: "",
        isLocked: false,
        internal: { isRunning: false },
      } satisfies TextEditorNodeData;
    case "image":
      return {
        imageUrl: null,
        isLocked: false,
        internal: { isRunning: false },
        style: "auto",
      } satisfies ImageNodeData;
    case "speech":
      return {
        isLocked: false,
        internal: { isRunning: false },
      } satisfies SpeechNodeData;
    case "instruction":
      return {
        isLocked: false,
        text: "",
        internal: { isRunning: false },
      } satisfies InstructionNodeData;
    case "comment":
      return { text: "", isLocked: false } satisfies CommentNodeData;
    default:
      throw new Error(`Unknown node type`);
  }
}

// PROGRESS TRACKING (no changes needed)

function initializeExecutionProgress(
  get: Getter,
  set: Setter,
  startNodeId: string,
) {
  const totalNodes = calculateTotalNodesToExecute(
    get(nodesAtom),
    get(edgesAtom),
    startNodeId,
  );
  set(executionProgressAtom, {
    isExecuting: true,
    totalNodesForExecution: totalNodes,
    executedNodesCount: 0,
  });
}

function updateExecutionProgress(
  get: Getter,
  set: Setter,
  startNodeId: string,
) {
  const progress = get(executionProgressAtom);
  const totalNodes = calculateTotalNodesToExecute(
    get(nodesAtom),
    get(edgesAtom),
    startNodeId,
  );
  set(executionProgressAtom, {
    ...progress,
    totalNodesForExecution: totalNodes,
    executedNodesCount: progress.executedNodesCount + 1,
  });
}

function finalizeExecutionProgress(
  get: Getter,
  set: Setter,
  visited: Set<string>,
  startNodeId: string,
) {
  const totalNodes = calculateTotalNodesToExecute(
    get(nodesAtom),
    get(edgesAtom),
    startNodeId,
  );

  if (visited.size >= totalNodes) {
    set(executionProgressAtom, {
      isExecuting: false,
      totalNodesForExecution: 0,
      executedNodesCount: 0,
    });
  }
}

export function calculateTotalNodesToExecute(
  nodes: AppNode[],
  edges: AppEdge[],
  startNodeId: string,
): number {
  const visited = new Set<string>();

  function countNodesRecursive(nodeId: string): number {
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.data.isLocked) return 0;

    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
    let totalNodes = 1;
    for (const edge of outgoingEdges) {
      totalNodes += countNodesRecursive(edge.target);
    }
    return totalNodes;
  }

  return countNodesRecursive(startNodeId);
}

export function recalculateExecutionProgress(
  get: Getter,
  set: Setter,
  startNodeId: string,
): void {
  const totalNodes = calculateTotalNodesToExecute(
    get(nodesAtom),
    get(edgesAtom),
    startNodeId,
  );

  const currentProgress = get(executionProgressAtom);
  if (currentProgress.isExecuting) {
    set(executionProgressAtom, {
      ...currentProgress,
      totalNodesForExecution: totalNodes,
    });
  }
}

// NODE STATE MANAGEMENT (no changes needed)

function setNodeRunning(
  set: Setter,
  nodeId: string,
  nodeType: AppNode["type"],
  isRunning: boolean,
) {
  set(updateNodeDataAtom, {
    nodeId,
    updatedData: { internal: { isRunning } },
    nodeType,
  });
}

// REFACTORED EXECUTION LOGIC

async function executeCurrentNode(get: Getter, set: Setter, node: AppNode) {
  console.log(`Preparing to execute node ${node.id} of type ${node.type}`);
  await delay(1000);

  const sourceNodes = collectSourceNodes(get, node.id);
  const context: ExecutionContext = {
    get,
    set,
    currentNode: node,
    sourceNodes,
  };

  const executor = findExecutor(context);

  if (executor) {
    await executor.execute(context);
  } else {
    console.log(`No generative executor found for node ${node.id}.`);
  }
}

async function processOutgoingEdges(
  get: Getter,
  set: Setter,
  currentNode: AppNode,
  visited: Set<string>,
  startNodeId: string,
) {
  const allNodes = get(nodesAtom);
  const allEdges = get(edgesAtom);
  const outgoingEdges = allEdges.filter(
    (edge) => edge.source === currentNode.id,
  );

  // Recalculate progress before processing edges in case structure changed
  recalculateExecutionProgress(get, set, startNodeId);

  for (const edge of outgoingEdges) {
    console.groupCollapsed(
      `Processing edge from node ${currentNode.id} to ${edge.target}`,
    );
    try {
      const nextNode = allNodes.find((n) => n.id === edge.target);
      if (!nextNode || !isNodeExecutable(nextNode, allEdges)) continue;

      if (currentNode.type === "textEditor") {
        executeTextNode(get, set, currentNode, nextNode);
      }

      await executeNodeLogic(get, set, nextNode.id, visited, startNodeId);
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
  startNodeId?: string,
) {
  const actualStartNodeId = startNodeId ?? nodeId;
  console.groupCollapsed(`executeNodeLogic: Executing node ${nodeId}`);
  try {
    if (visited.size === 0) {
      initializeExecutionProgress(get, set, actualStartNodeId);
    }
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const currentNode = get(nodesAtom).find((n) => n.id === nodeId);
    if (!currentNode || !isNodeExecutable(currentNode, get(edgesAtom))) {
      console.warn("Node is not executable:", currentNode);
      return;
    }

    try {
      setNodeRunning(set, nodeId, currentNode.type, true);
      set(isExecutingNodeAtom, true);

      // Ensure progress is synced before execution
      recalculateExecutionProgress(get, set, actualStartNodeId);

      await executeCurrentNode(get, set, currentNode);
      await processOutgoingEdges(
        get,
        set,
        currentNode,
        visited,
        actualStartNodeId,
      );

      updateExecutionProgress(get, set, actualStartNodeId);
    } finally {
      setNodeRunning(set, nodeId, currentNode.type, false);
      finalizeExecutionProgress(get, set, visited, actualStartNodeId);
    }
  } finally {
    set(isExecutingNodeAtom, false); // Ensure this is always reset
    console.groupEnd();
  }
}
