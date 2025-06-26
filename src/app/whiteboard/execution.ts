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
      case "textEditor": {
        // text->text
        set(updateNodeDataAtom, {
          nodeId: nextNode.id,
          updatedData: { text: thisNode.data.text },
          nodeType: nextNode.type,
        });
        break;
      }
      case "image": {
        // text->image: no need to update data, image node will get text from sourceNodes
        break;
      }
      case "speech": {
        // text->speech: no need to update data, speech node will get text from sourceNodes
        break;
      }
      default: {
        throw new Error(
          "Unhandled node type in executeTextNode: " + nextNode.type,
        );
      }
    }
  } finally {
    console.groupEnd();
  }
}

async function executeImageNode(
  get: Getter,
  set: Setter,
  currentNode: ImageNodeType,
  _targetNode: AppNode, // Prefixed with _ to indicate intentionally unused parameter
) {
  console.groupCollapsed(
    `executeImageNode: Executing image node ${currentNode.id}`,
  );
  try {
    const whiteboardId = get(currentWhiteboardIdAtom);
    if (!whiteboardId) {
      throw new Error("whiteboardId not set");
    }

    // Check if the node is rate limited
    if (currentNode.data.internal?.isRateLimited) {
      console.log("Node cannot run: rate limit reached");
      return;
    }

    console.log("Running an image node...");
    // Get all edges that connect to this image node
    const incomingConnections = get(edgesAtom).filter(
      (edge) => edge.target === currentNode.id,
    );

    // Find all source nodes that are connected to this image node
    const allNodes = get(nodesAtom);
    const connectedSourceNodes = allNodes.filter((node) =>
      incomingConnections.some((connection) => connection.source === node.id),
    );

    const sourceNodes = connectedSourceNodes
      .filter(
        (node): node is TextEditorNodeType | ImageNodeType =>
          node.type === "image" || node.type === "textEditor",
      )
      .map((node) => {
        // We only need some data from the node, so we destructure it
        const { type, id, data } = node;
        // and then tell TS "this shape is exactly the same as the incoming node"
        return { type, id, data } as typeof node;
      });

    if (!currentNode.data.internal?.generateAndStoreImageAction) {
      throw new Error("generateAndStoreImageAction not defined.");
    }

    console.log("Running generateAndStoreImageAction");
    await currentNode.data.internal.generateAndStoreImageAction({
      nodeId: currentNode.id,
      sourceNodes,
      whiteboardId: whiteboardId as Id<"whiteboards">,
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
  try {
    console.groupCollapsed(
      `executeSpeechNode: Executing speech node ${currentNode.id}`,
    );
    const whiteboardId = get(currentWhiteboardIdAtom);
    if (!whiteboardId) {
      throw new Error("whiteboardId not set");
    }

    // Check if the node is rate limited
    if (currentNode.data.internal?.isRateLimited) {
      console.log("Node cannot run: rate limit reached");
      return;
    }

    // Get all edges that connect to this image node
    const incomingConnections = get(edgesAtom).filter(
      (edge) => edge.target === currentNode.id,
    );

    // Find all source nodes that are connected to this image node
    const allNodes = get(nodesAtom);
    const connectedSourceNodes = allNodes.filter((node) =>
      incomingConnections.some((connection) => connection.source === node.id),
    );

    const sourceNodes = connectedSourceNodes
      .filter((node): node is TextEditorNodeType => node.type === "textEditor")
      .map((node) => {
        // We only need some data from the node, so we destructure it
        const { type, id, data } = node;
        // and then tell TS "this shape is exactly the same as the incoming node"
        return { type, id, data } as typeof node;
      });

    if (!currentNode.data.internal?.generateAndStoreSpeechAction) {
      throw new Error("generateAndStoreSpeechAction not defined.");
    }
    console.log("Running generateAndStoreSpeechAction");
    await currentNode.data.internal.generateAndStoreSpeechAction({
      nodeId: currentNode.id,
      sourceNodes,
      whiteboardId: whiteboardId as Id<"whiteboards">,
    });
  } catch (error) {
    console.error("Error executing speech node:", error);
  } finally {
    console.groupEnd();
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
    totalNodes += calculateTotalNodesToExecute(
      nodes,
      edges,
      edge.target,
      visited,
    );
  }

  return totalNodes;
}

export async function executeNodeLogic(
  get: Getter,
  set: Setter,
  nodeId: string,
  visited: Set<string> = new Set<string>(),
) {
  console.groupCollapsed(`executeNodeLogic: Executing node ${nodeId}`);
  try {
    // If this is the initial call (no visited nodes), calculate total and initialize progress
    if (visited.size === 0) {
      const allNodes = get(nodesAtom);
      const allEdges = get(edgesAtom);
      const totalNodes = calculateTotalNodesToExecute(
        allNodes,
        allEdges,
        nodeId,
      );
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

    if (
      !thisNode ||
      thisNode.data.isLocked ||
      ("isRunning" in thisNode.data && thisNode.data.isRunning)
    ) {
      console.warn("Node is either locked or already running:", thisNode);
      return;
    }

    try {
      set(updateNodeDataAtom, {
        nodeId,
        updatedData: { isRunning: true },
        nodeType: thisNode.type,
      });
      set(isExecutingNodeAtom, true); // Update progress after processing this node
      const progress = get(executionProgressAtom);
      set(executionProgressAtom, {
        ...progress,
        executedNodesCount: progress.executedNodesCount + 1,
      });

      // If this is an image node, execute it first regardless of outgoing edges
      if (thisNode.type === "image") {
        console.log(
          "Detected image node. Waiting 1 second before executing image node logic.",
        );
        await delay(1000);
        await executeImageNode(get, set, thisNode, {} as AppNode);
      }
      if (thisNode.type === "speech") {
        console.log(
          "Detected speech node. Waiting 1 second before executing speech node logic.",
        );
        await delay(1000);
        await executeSpeechNode(get, set, thisNode, {} as AppNode);
      }
      // Get outgoing edges for further node execution
      const outgoingEdges = allEdges.filter((edge) => edge.source === nodeId);
      console.log("Outgoing edges:", outgoingEdges);

      // The execution logic for non-image nodes or subsequent connections
      for (const edge of outgoingEdges) {
        console.groupCollapsed(
          `executeNodeLogic: Processing edge from node ${nodeId} to ${edge.target}`,
        );
        try {
          console.log("Processing edge from node", nodeId, "to", edge.target);
          const nextNode = allNodes.find((n) => n.id === edge.target);
          if (!nextNode) {
            console.warn("Next node not found for edge:", edge);
            continue;
          }
          if (nextNode.data.isLocked) {
            console.warn("Next node is locked:", nextNode);
            continue;
          }

          console.log(
            "Executing node logic for current node type:",
            thisNode.type,
            "with next node:",
            nextNode.id,
          ); // Only handle non-image nodes here since image nodes are handled above
          switch (thisNode.type) {
            case "textEditor": {
              console.log(
                "Detected textEditor node. Waiting 1 second before executing text node logic.",
              );
              await delay(1000);
              console.log(
                "Executing text node logic: passing text from",
                thisNode.id,
                "to",
                nextNode.id,
              );
              executeTextNode(get, set, thisNode, nextNode);
              break;
            }
            default: {
              console.error(
                "Unhandled node type in executeNodeLogic:",
                thisNode.type,
              );
              throw new Error("Unhandled node type in executeNodeLogic");
            }
          }

          console.log(
            "Recursively executing node logic for next node:",
            nextNode.id,
          );
          await executeNodeLogic(get, set, nextNode.id, visited);
          console.log("Finished executing node logic for node:", nextNode.id);
        } finally {
          console.groupEnd();
        }
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
  } finally {
    console.groupEnd();
  }
}
