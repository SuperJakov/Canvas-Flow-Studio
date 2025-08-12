import type { IExecutor, ExecutionContext } from "./types";
import type { WebsiteNodeType } from "~/Types/nodes";
import { getWebsiteAction } from "~/execution/nodeActionRegistry";
import {
  collectSourceNodes,
  validateWhiteboardId,
} from "~/execution/executionLogic";

class WebsiteGenerationExecutor implements IExecutor {
  canExecute({ currentNode }: ExecutionContext): boolean {
    return currentNode.type === "website";
  }

  async execute({ get, set: _, currentNode }: ExecutionContext): Promise<void> {
    console.groupCollapsed(
      `WebsiteGenerationExecutor: Executing for node ${currentNode.id}`,
    );
    const websiteNode = currentNode as WebsiteNodeType;

    try {
      const whiteboardId = validateWhiteboardId(get);

      const action = getWebsiteAction(websiteNode.id);
      if (!action) {
        console.error(
          "Website node executed before its callback was registered. Skipping.",
        );
        return;
      }

      const directParentNodes = collectSourceNodes(get, websiteNode.id);
      const sourceNodes = directParentNodes.flatMap((parentNode) => {
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
        return [];
      });

      if (sourceNodes.length === 0) {
        console.log(
          "No valid source nodes found after filtering. Skipping execution.",
        );
        return;
      }

      await action({
        nodeId: websiteNode.id,
        sourceNodes,
        whiteboardId,
      });
    } finally {
      console.groupEnd();
    }
  }
}

export const websiteGenerationExecutor = new WebsiteGenerationExecutor();
