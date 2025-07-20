import type { Setter } from "jotai";
import type { Getter } from "jotai";
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
} from "./atoms";
import { v4 as uuidv4 } from "uuid";
import { getImageAction, getSpeechAction } from "./nodeActionRegistry";

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

function validateWhiteboardId(get: Getter) {
  const whiteboardId = get(currentWhiteboardIdAtom);
  if (!whiteboardId) {
    throw new Error("whiteboardId not set");
  }
  return whiteboardId;
}

export function isNodeExecutable(node: AppNode): boolean {
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
      case "instruction":
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

function collectSourceNodes(
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

      // Any other node types (comment, …) are irrelevant for payload
      default:
        break;
    }
  }

  return payloadNodes;
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

    const action = getImageAction(currentNode.id);
    if (!action) {
      console.error(
        "Image node executed before its callback was registered. Skipping.",
      );
      return;
    }

    // Get direct parent nodes
    const directParentNodes = collectSourceNodes(get, currentNode.id);

    // Process parents to find valid sources according to filtering rules
    const sourceNodes = directParentNodes.flatMap((parentNode) => {
      // Rule: Disallow directly connected images
      if (parentNode.type === "image") {
        console.log(`Ignoring directly connected image node: ${parentNode.id}`);
        return [];
      }

      // Rule: Allow directly connected text editors
      if (parentNode.type === "textEditor") {
        return [
          {
            id: parentNode.id,
            type: "textEditor" as const,
            data: {
              isLocked: parentNode.data.isLocked,
              text: parentNode.data.text,
            },
          },
        ];
      }

      // Rule: Allow images connected via instruction node (image -> instruction -> thisNode)
      if (parentNode.type === "instruction") {
        // Instruction node provides its text as a source
        const sourcesFromInstruction = [
          {
            id: parentNode.id,
            type: "textEditor" as const, // Treat as text for the backend
            data: {
              isLocked: parentNode.data.isLocked,
              text: parentNode.data.text,
            },
          },
        ];

        // Look for image grandparents behind the instruction node
        const grandParentNodes = collectSourceNodes(get, parentNode.id);
        const imageGrandParents = grandParentNodes
          .filter((gp) => gp.type === "image")
          .map((imageNode) => ({
            id: imageNode.id,
            type: "image" as const,
            data: {
              isLocked: imageNode.data.isLocked,
              imageUrl: imageNode.data.imageUrl ?? null,
              internal: {
                isRunning: parentNode.data.internal?.isRunning ?? false,
              },
            },
          }));

        return [...sourcesFromInstruction, ...imageGrandParents];
      }

      return [];
    });

    console.log(
      `Running generateAndStoreImageAction with ${sourceNodes.length} source node(s)`,
      sourceNodes,
    );

    if (sourceNodes.length === 0) {
      console.log(
        "No valid source nodes found after filtering. Skipping execution.",
      );
      return;
    }

    await action({
      nodeId: currentNode.id,
      sourceNodes,
      whiteboardId,
      style: currentNode.data.style,
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
    const generateAndStoreSpeechAction = getSpeechAction(currentNode.id);
    if (!generateAndStoreSpeechAction) {
      console.error(
        "Speech node executed before its callback was registered. Skipping.",
      );
      return;
    }

    // Get direct parent nodes using the updated helper function
    const directParentNodes = collectSourceNodes(get, currentNode.id);

    // Process parents to find valid sources according to filtering rules
    const sourceNodes = directParentNodes.flatMap((parentNode) => {
      // Rule: Disallow directly connected speech nodes
      if (parentNode.type === "speech") {
        console.log(
          `Ignoring directly connected speech node: ${parentNode.id}`,
        );
        return [];
      }

      // Rule: Allow directly connected text editors
      if (parentNode.type === "textEditor") {
        return [
          {
            id: parentNode.id,
            type: "textEditor" as const,
            data: {
              isLocked: parentNode.data.isLocked,
              text: parentNode.data.text,
            },
          },
        ];
      }

      // Rule: Allow speech/text connected via an instruction node
      if (parentNode.type === "instruction") {
        // Instruction node provides its text as a source
        const sourcesFromInstruction = [
          {
            id: parentNode.id,
            type: "instruction" as const,
            data: {
              text: parentNode.data.text,
            },
          },
        ];

        // Look for speech or text grandparents behind the instruction node
        const grandParentNodes = collectSourceNodes(get, parentNode.id);
        const validGrandParents = grandParentNodes
          .filter(
            (gp): gp is SpeechNodeType | TextEditorNodeType =>
              gp.type === "speech" || gp.type === "textEditor",
          )
          .map((gpNode) => {
            if (gpNode.type === "speech") {
              return {
                id: gpNode.id,
                type: "speech" as const,
              };
            }
            // This must be a textEditor node due to the filter
            return {
              id: gpNode.id,
              type: "textEditor" as const,
              data: {
                isLocked: gpNode.data.isLocked,
                text: gpNode.data.text,
              },
            };
          });

        return [...sourcesFromInstruction, ...validGrandParents];
      }

      return [];
    });

    console.log(
      `Running generateAndStoreSpeechAction with ${sourceNodes.length} source node(s)`,
      sourceNodes,
    );

    if (sourceNodes.length === 0) {
      console.log(
        "No valid source nodes found after filtering. Skipping execution.",
      );
      return;
    }

    await generateAndStoreSpeechAction({
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

async function executeInstructionNode(
  get: Getter,
  set: Setter,
  thisNode: InstructionNodeType,
  _targetNode: AppNode,
) {
  console.groupCollapsed(
    `executeInstructionNode: Executing instruction node ${thisNode.id}`,
  );

  try {
    const instruction = thisNode.data.text;

    const connectedSourceNodes = collectSourceNodes(get, thisNode.id);
    const inputNodeTypes = connectedSourceNodes
      .filter(
        (node) =>
          node.type === "textEditor" ||
          node.type === "image" ||
          node.type === "speech",
      )
      .map((node) => node.type);

    const imageSource = connectedSourceNodes.find(
      (node) => node.type === "image",
    );

    console.log("Instruction:", instruction);
    console.log("Connected node types:", inputNodeTypes);

    const { detectOutputNodeTypeAction } = thisNode.data?.internal ?? {};
    if (!detectOutputNodeTypeAction) {
      throw new Error("detectOutputNodeTypeAction is undefined");
    }

    const outputNodeTypeRaw = await detectOutputNodeTypeAction({
      instruction,
      inputNodeTypes,
    });

    // Normalize output node type to match expected casing
    const outputNodeType =
      outputNodeTypeRaw === "texteditor" ? "textEditor" : outputNodeTypeRaw;
    const newNodeId = uuidv4();

    // Determine style if output is image and image source exists
    const styleToUse =
      outputNodeType === "image" && imageSource
        ? imageSource.data.style
        : "auto";

    const newNode = {
      id: newNodeId,
      type: outputNodeType,
      position: {
        x: thisNode.position.x,
        y: thisNode.position.y + 300,
      },
      data: {
        ...getDefaultNodeData(outputNodeType),
        ...(outputNodeType === "image" && { style: styleToUse }),
      },
    } as AppNode;

    const updatedNodes = [...get(nodesAtom), newNode];
    set(nodesAtom, updatedNodes);

    const newEdge: AppEdge = {
      id: `edge-${thisNode.id}-${newNodeId}`,
      source: thisNode.id,
      target: newNodeId,
      type: "default",
    };

    const updatedEdges = [...get(edgesAtom), newEdge];
    set(edgesAtom, updatedEdges);

    console.log(`Created new ${outputNodeType} node with ID: ${newNodeId}`);
  } catch (error) {
    console.error("Error executing instruction node:", error);
  } finally {
    console.groupEnd();
  }
}

function getDefaultNodeData(nodeType: AppNode["type"]) {
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
        internal: {
          isRunning: false,
        },
        // internal will be populated later when the node is initialized with actions
      } satisfies SpeechNodeData;

    case "instruction":
      return {
        isLocked: false,
        text: "",
        internal: {
          isRunning: false,
        },
      } satisfies InstructionNodeData;

    case "comment":
      return {
        text: "",
        isLocked: false,
      } satisfies CommentNodeData;
    default:
      throw new Error(`Unknown node type`);
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
    updatedData: { internal: { isRunning } },
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
    case "instruction":
      await executeInstructionNode(get, set, node, {} as AppNode);
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
      if (
        currentNode.type === "image" ||
        currentNode.type === "speech" ||
        currentNode.type === "instruction"
      ) {
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
