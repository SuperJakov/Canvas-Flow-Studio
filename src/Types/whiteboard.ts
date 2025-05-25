import type { Id } from "../../convex/_generated/dataModel";

export interface Whiteboard {
  _id: Id<"whiteboards">;
  title: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  nodes: {
    id: string;
    type: "textEditor";
    data: {
      text: string;
      isLocked: boolean;
      isRunning: boolean;
    };
    position: {
      x: number;
      y: number;
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
  }[];
}
