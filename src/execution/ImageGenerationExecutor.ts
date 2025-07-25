// src/core/execution/ImageGenerationExecutor.ts

import type { IExecutor, ExecutionContext } from "./types";
import type { ImageNodeType } from "~/Types/nodes";
import { getImageAction } from "~/execution/nodeActionRegistry";
import {
  collectSourceNodes,
  validateWhiteboardId,
  isNodeRateLimited,
} from "~/execution/executionLogic";

class ImageGenerationExecutor implements IExecutor {
  canExecute({ currentNode }: ExecutionContext): boolean {
    return currentNode.type === "image";
  }

  async execute({ get, set: _, currentNode }: ExecutionContext): Promise<void> {
    console.groupCollapsed(
      `ImageGenerationExecutor: Executing for node ${currentNode.id}`,
    );
    const imageNode = currentNode as ImageNodeType;

    try {
      const whiteboardId = validateWhiteboardId(get);

      if (isNodeRateLimited(imageNode)) {
        console.log("Node cannot run: rate limit reached");
        return;
      }

      const action = getImageAction(imageNode.id);
      if (!action) {
        console.error(
          "Image node executed before its callback was registered. Skipping.",
        );
        return;
      }

      const directParentNodes = collectSourceNodes(get, imageNode.id);
      const sourceNodes = directParentNodes.flatMap((parentNode) => {
        if (parentNode.type === "image") {
          return [];
        }
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
        if (parentNode.type === "instruction") {
          const sourcesFromInstruction = [
            {
              id: parentNode.id,
              type: "textEditor" as const,
              data: {
                isLocked: parentNode.data.isLocked,
                text: parentNode.data.text,
              },
            },
          ];
          const grandParentNodes = collectSourceNodes(get, parentNode.id);
          const imageGrandParents = grandParentNodes
            .filter((gp): gp is ImageNodeType => gp.type === "image")
            .map((imgNode) => ({
              id: imgNode.id,
              type: "image" as const,
              data: {
                isLocked: imgNode.data.isLocked,
                imageUrl: imgNode.data.imageUrl ?? null,
                internal: {
                  isRunning: imgNode.data.internal?.isRunning ?? false,
                },
              },
            }));
          return [...sourcesFromInstruction, ...imageGrandParents];
        }
        return [];
      });

      if (sourceNodes.length === 0) {
        console.log(
          "No valid source nodes found after filtering. Skipping execution.",
        );
        return;
      }

      await action({
        nodeId: imageNode.id,
        sourceNodes,
        whiteboardId,
        style: imageNode.data.style,
      });
    } finally {
      console.groupEnd();
    }
  }
}

export const imageGenerationExecutor = new ImageGenerationExecutor();
