import type { AppEdge, AppNode } from "~/Types/nodes";

export const initialEdges: AppEdge[] = [
  { id: "e1-2", source: "1", target: "2", type: "default" },
  { id: "e2-3", source: "2", target: "3", animated: true, type: "default" },
];

export const initialNodes: AppNode[] = [
  {
    id: "5",
    type: "textEditor",
    data: {
      text: "This is a text node",
      isLocked: false,
      isRunning: false,
    },
    position: { x: 400, y: 125 },
  },
];
