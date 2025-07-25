// src/core/execution/TextModificationExecutor.ts

import type { IExecutor, ExecutionContext } from "./types";
import type { TextEditorNodeType } from "~/Types/nodes";
import { getTextAction } from "~/app/whiteboard/nodeActionRegistry";
import { collectSourceNodes } from "~/execution/executionLogic";
import { updateNodeDataAtom } from "~/app/whiteboard/atoms";

class TextModificationExecutor implements IExecutor {
  canExecute({ get, currentNode, sourceNodes }: ExecutionContext): boolean {
    if (currentNode.type !== "textEditor") {
      return false;
    }
    const instructionParent = sourceNodes.find((p) => p.type === "instruction");
    if (!instructionParent) {
      return false;
    }
    const grandParentNodes = collectSourceNodes(get, instructionParent.id);
    return grandParentNodes.some((gp) => gp.type === "textEditor");
  }

  async execute({ get, set, currentNode }: ExecutionContext): Promise<void> {
    console.groupCollapsed(
      `TextModificationExecutor: Executing for node ${currentNode.id}`,
    );
    const textNode = currentNode as TextEditorNodeType;

    try {
      const modifyTextAction = getTextAction(textNode.id);
      if (!modifyTextAction) {
        console.error(
          "Generative text node executed before its callback was registered. Skipping.",
        );
        return;
      }

      const parentNodes = collectSourceNodes(get, textNode.id);
      const instructionParent = parentNodes.find(
        (p) => p.type === "instruction",
      );
      const grandParentNodes = collectSourceNodes(get, instructionParent!.id);
      const textGrandParent = grandParentNodes.find(
        (gp) => gp.type === "textEditor",
      );

      set(updateNodeDataAtom, {
        nodeId: textNode.id,
        updatedData: { internal: { isRunning: true } },
        nodeType: "textEditor",
      });

      const result = await modifyTextAction({
        instruction: instructionParent!.data.text,
        text: textGrandParent!.data.text,
      });

      set(updateNodeDataAtom, {
        nodeId: textNode.id,
        updatedData: { text: result },
        nodeType: "textEditor",
      });
    } catch (error) {
      console.error("Error executing generative text node:", error);
    } finally {
      console.groupEnd();
    }
  }
}

export const textModificationExecutor = new TextModificationExecutor();
