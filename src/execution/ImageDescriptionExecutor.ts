// src/core/execution/ImageDescriptionExecutor.ts

import type { IExecutor, ExecutionContext } from "./types";
import type { TextEditorNodeType, ImageNodeType } from "~/Types/nodes";
import { getImageDescriptionAction } from "~/execution/nodeActionRegistry";
import { collectSourceNodes } from "~/execution/executionLogic";
import { updateNodeDataAtom } from "~/app/whiteboard/atoms";

class ImageDescriptionExecutor implements IExecutor {
  canExecute({ currentNode, sourceNodes }: ExecutionContext): boolean {
    if (currentNode.type !== "textEditor") {
      return false;
    }
    return sourceNodes.some((node) => node.type === "image");
  }

  async execute({ get, set, currentNode }: ExecutionContext): Promise<void> {
    console.groupCollapsed(
      `ImageDescriptionExecutor: Executing for node ${currentNode.id}`,
    );
    const textNode = currentNode as TextEditorNodeType;

    try {
      const describeImagesAction = getImageDescriptionAction(textNode.id);
      if (!describeImagesAction) {
        console.error(
          "Text node executed before its callback was registered. Skipping.",
        );
        return;
      }

      const parentNodes = collectSourceNodes(get, textNode.id);
      const imageNodes = parentNodes.filter(
        (node): node is ImageNodeType => node.type === "image",
      );

      if (imageNodes.length === 0) {
        console.log("No image nodes found. Skipping execution.");
        return;
      }

      set(updateNodeDataAtom, {
        nodeId: textNode.id,
        updatedData: { internal: { isRunning: true } },
        nodeType: "textEditor",
      });

      const result = await describeImagesAction({
        imageNodeIds: imageNodes.map((node) => node.id),
      });

      set(updateNodeDataAtom, {
        nodeId: textNode.id,
        updatedData: { text: result ?? undefined },
        nodeType: "textEditor",
      });
    } catch (error) {
      console.error("Error executing image description node:", error);
    } finally {
      console.groupEnd();
    }
  }
}

export const imageDescriptionExecutor = new ImageDescriptionExecutor();
