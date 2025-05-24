import type { Edge, Node } from "@xyflow/react";

export type TextEditorNodeData = {
  text: string;
};

export type TextEditorNodeType = Node<TextEditorNodeData, "textEditor">;

export type AppNode = TextEditorNodeType;

// This is unnecessary, but it is kept for the future if more edge types are added
export type AppEdge = Edge;
