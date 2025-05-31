import type { Edge, Node } from "@xyflow/react";
import type { api } from "convex/_generated/api";
import type { ReactAction } from "convex/react";

export type TextEditorNodeData = {
  text: string;
  isLocked: boolean;
  isRunning: boolean;
};

export type ImageNodeData = {
  imageUrl: string | null;
  isLocked: boolean;
  isRunning: boolean;
  internal?: {
    generateAndStoreImageAction?: ReactAction<
      typeof api.imageNodes.generateAndStoreImage
    >;
  };
};

export type TextEditorNodeType = Node<TextEditorNodeData, "textEditor">;
export type ImageNodeType = Node<ImageNodeData, "image">;

export type AppNode = TextEditorNodeType | ImageNodeType;

// This is unnecessary, but it is kept for the future if more edge types are added
export type AppEdge = Edge;
