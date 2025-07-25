// src/core/execution/SpeechGenerationExecutor.ts

import type { IExecutor, ExecutionContext } from "./types";
import type { SpeechNodeType, TextEditorNodeType } from "~/Types/nodes";
import { getSpeechAction } from "~/app/whiteboard/nodeActionRegistry";
import {
  collectSourceNodes,
  validateWhiteboardId,
  isNodeRateLimited,
} from "~/execution/executionLogic";

class SpeechGenerationExecutor implements IExecutor {
  canExecute({ currentNode }: ExecutionContext): boolean {
    return currentNode.type === "speech";
  }

  async execute({ get, set, currentNode }: ExecutionContext): Promise<void> {
    console.groupCollapsed(
      `SpeechGenerationExecutor: Executing for node ${currentNode.id}`,
    );
    const speechNode = currentNode as SpeechNodeType;

    try {
      const whiteboardId = validateWhiteboardId(get);

      if (isNodeRateLimited(speechNode)) {
        console.log("Node cannot run: rate limit reached");
        return;
      }

      const generateAndStoreSpeechAction = getSpeechAction(speechNode.id);
      if (!generateAndStoreSpeechAction) {
        console.error(
          "Speech node executed before its callback was registered. Skipping.",
        );
        return;
      }

      const directParentNodes = collectSourceNodes(get, speechNode.id);
      const sourceNodes = directParentNodes.flatMap((parentNode) => {
        if (parentNode.type === "speech") return [];
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
              type: "instruction" as const,
              data: { text: parentNode.data.text },
            },
          ];
          const grandParentNodes = collectSourceNodes(get, parentNode.id);
          const validGrandParents = grandParentNodes
            .filter(
              (gp): gp is SpeechNodeType | TextEditorNodeType =>
                gp.type === "speech" || gp.type === "textEditor",
            )
            .map((gpNode) => {
              if (gpNode.type === "speech")
                return { id: gpNode.id, type: "speech" as const };
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

      if (sourceNodes.length === 0) {
        console.log(
          "No valid source nodes found after filtering. Skipping execution.",
        );
        return;
      }

      await generateAndStoreSpeechAction({
        nodeId: speechNode.id,
        sourceNodes,
        whiteboardId,
      });
    } catch (error) {
      console.error("Error executing speech node:", error);
    } finally {
      console.groupEnd();
    }
  }
}

export const speechGenerationExecutor = new SpeechGenerationExecutor();
