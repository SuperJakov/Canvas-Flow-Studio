import type { Setter } from "jotai";
import type { Getter } from "jotai";
import type { AppNode, AppEdge } from "~/Types/nodes";
import {
  edgesAtom,
  isExecutingNodeAtom,
  nodesAtom,
  updateNodeDataAtom,
  executionProgressAtom,
} from "./atoms";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function executeTextNode(
  get: Getter,
  set: Setter,
  thisNode: AppNode,
  nextNode: AppNode,
) {
  switch (nextNode.type) {
    case "textEditor": {
      // text->text
      set(updateNodeDataAtom, {
        nodeId: nextNode.id,
        updatedData: { text: thisNode.data.text },
        nodeType: nextNode.type,
      });
      break;
    }
    default: {
      throw new Error(
        "Unhandled node type in executeTextNode: " + nextNode.type,
      );
    }
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
  let totalNodes = 1; // Count current node

  for (const edge of outgoingEdges) {
    totalNodes += calculateTotalNodesToExecute(nodes, edges, edge.target, visited);
  }

  return totalNodes;
}

export async function executeNodeLogic(
  get: Getter,
  set: Setter,
  nodeId: string,
  visited: Set<string> = new Set<string>(),
) {
  // If this is the initial call (no visited nodes), calculate total and initialize progress
  if (visited.size === 0) {
    const allNodes = get(nodesAtom);
    const allEdges = get(edgesAtom);
    const totalNodes = calculateTotalNodesToExecute(allNodes, allEdges, nodeId);
    set(executionProgressAtom, {
      isExecuting: true,
      totalNodesForExecution: totalNodes,
      executedNodesCount: 0,
    });
  }

  if (visited.has(nodeId)) return;
  visited.add(nodeId);
  const allNodes = get(nodesAtom);
  const allEdges = get(edgesAtom);
  const thisNode = allNodes.find((n) => n.id === nodeId);
  if (!thisNode || thisNode.data.isLocked || thisNode.data.isRunning) {
    console.warn("Node is either locked or already running:", thisNode);
    return;
  }

  try {
    set(updateNodeDataAtom, {
      nodeId,
      updatedData: { isRunning: true },
      nodeType: thisNode.type,
    });
    set(isExecutingNodeAtom, true);

    const outgoingEdges = allEdges.filter((edge) => edge.source === nodeId);
    console.log("Outgoing edges:", outgoingEdges);

    // Update progress after processing this node
    const progress = get(executionProgressAtom);
    set(executionProgressAtom, {
      ...progress,
      executedNodesCount: progress.executedNodesCount + 1,
    });

    // The execution logic for the node
    for (const edge of outgoingEdges) {
      const nextNode = allNodes.find((n) => n.id === edge.target);
      if (!nextNode || nextNode.data.isLocked) continue;

      switch (thisNode.type) {
        case "textEditor": {
          await delay(1000);
          executeTextNode(get, set, thisNode, nextNode);
          break;
        }
        default: {
          throw new Error("Unhandled node type in executeNodeLogic");
        }
      }
      await executeNodeLogic(get, set, nextNode.id, visited);
    }
  } finally {
    // Always set isRunning back to false when this node is done
    set(updateNodeDataAtom, {
      nodeId,
      updatedData: { isRunning: false },
      nodeType: thisNode.type,
    });

    // If this is the last node being executed, reset the progress
    if (visited.size === get(executionProgressAtom).totalNodesForExecution) {
      set(executionProgressAtom, {
        isExecuting: false,
        totalNodesForExecution: 0,
        executedNodesCount: 0,
      });
    }
  }
}
