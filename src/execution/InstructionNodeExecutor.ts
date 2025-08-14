import type { IExecutor, ExecutionContext } from "./types";
import type { InstructionNodeType, AppNode, AppEdge } from "~/Types/nodes";
import { v4 as uuidv4 } from "uuid";
import { nodesAtom, edgesAtom } from "~/app/whiteboard/atoms";
import { getDefaultNodeData } from "~/execution/executionLogic";

class InstructionNodeExecutor implements IExecutor {
  canExecute({ currentNode }: ExecutionContext): boolean {
    return currentNode.type === "instruction";
  }

  async execute({
    get,
    set,
    currentNode,
    sourceNodes,
  }: ExecutionContext): Promise<void> {
    console.groupCollapsed(
      `InstructionNodeExecutor: Executing for node ${currentNode.id}`,
    );
    const instructionNode = currentNode as InstructionNodeType;

    try {
      const instruction = instructionNode.data.text;
      const inputNodeTypes = sourceNodes
        .filter(
          (node) =>
            node.type === "textEditor" ||
            node.type === "image" ||
            node.type === "speech",
        )
        .map((node) => node.type);
      const imageSource = sourceNodes.find((node) => node.type === "image");

      const { detectOutputNodeTypeAction } =
        instructionNode.data?.internal ?? {};
      if (!detectOutputNodeTypeAction) {
        throw new Error("detectOutputNodeTypeAction is undefined");
      }

      const outputNodeTypeRaw = await detectOutputNodeTypeAction({
        instruction,
        inputNodeTypes,
      });
      const outputNodeType =
        outputNodeTypeRaw === "texteditor" ? "textEditor" : outputNodeTypeRaw; // Edges that point from current instruction node to some other

      const outPutEdges = get(edgesAtom).filter(
        (edge) => edge.source === instructionNode.id,
      );
      const nodes = get(nodesAtom);
      // Find nodes that are targets of the current instruction node's outgoing edges
      const targetNodeIds = new Set(outPutEdges.map((edge) => edge.target));
      const targetNodes = nodes.filter((node) => targetNodeIds.has(node.id));

      // Check if a target node with the determined outputNodeType already exists
      const hasExistingOutputNode = targetNodes.some(
        (node) => node.type === outputNodeType,
      );

      // If no such node exists, create and connect a new one.
      if (!hasExistingOutputNode) {
        const newNodeId = uuidv4();
        const styleToUse =
          outputNodeType === "image" && imageSource?.type === "image"
            ? imageSource.data.style
            : "auto";

        const newNode = {
          id: newNodeId,
          type: outputNodeType,
          position: {
            x: instructionNode.position.x,
            y: instructionNode.position.y + 300,
          },
          data: {
            ...getDefaultNodeData(outputNodeType),
            ...(outputNodeType === "image" && { style: styleToUse }),
          },
          ...(outputNodeType === "textEditor" && { width: 270, height: 170 }),
        } as AppNode;

        set(nodesAtom, [...get(nodesAtom), newNode]);

        const newEdge: AppEdge = {
          id: `edge-${instructionNode.id}-${newNodeId}`,
          source: instructionNode.id,
          target: newNodeId,
          type: "default",
        };
        set(edgesAtom, [...get(edgesAtom), newEdge]);
      } else {
        console.log(
          `Skipping node creation as a target of type '${outputNodeType}' already exists.`,
        );
      }
    } catch (error) {
      console.error("Error executing instruction node:", error);
    } finally {
      console.groupEnd();
    }
  }
}

export const instructionNodeExecutor = new InstructionNodeExecutor();
