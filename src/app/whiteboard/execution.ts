import type { Setter } from "jotai";
import type { Getter } from "jotai";
import type { AppNode } from "~/Types/nodes";
import {
  edgesAtom,
  isExecutingNodeAtom,
  nodesAtom,
  updateNodeDataAtom,
} from "./atoms";

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

export async function executeNodeLogic(
  get: Getter,
  set: Setter,
  nodeId: string,
  visited: Set<string> = new Set<string>(),
) {
  if (visited.has(nodeId)) return; // Base case to prevent infinite loops
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
    set(isExecutingNodeAtom, true); // Global flag
    const outgoingEdges = allEdges.filter((edge) => edge.source === nodeId);
    console.log("Outgoing edges:", outgoingEdges);

    // The execution logic for the node
    for (const edge of outgoingEdges) {
      const nextNode = allNodes.find((n) => n.id === edge.target);
      if (!nextNode || nextNode.data.isLocked) continue;

      switch (thisNode.type) {
        case "textEditor": {
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
    // Always set isRunning back to false when this node is done, even if there was an error
    set(updateNodeDataAtom, {
      nodeId,
      updatedData: { isRunning: false },
      nodeType: thisNode.type,
    });
  }
}
