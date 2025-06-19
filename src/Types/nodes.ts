import type { Edge, Node } from "@xyflow/react";
import type { api } from "../../convex/_generated/api";
import type { ReactAction } from "convex/react";

export type CommentNodeData = {
  text: string;
  isLocked: boolean;
  zIndex?: number;
};

export type TextEditorNodeData = {
  text: string;
  isLocked: boolean;
  isRunning: boolean;
  zIndex?: number;
};

export type ImageNodeData = {
  imageUrl: string | null;
  isLocked: boolean;
  isRunning: boolean;
  internal?: {
    generateAndStoreImageAction?: ReactAction<
      typeof api.imageNodes.generateAndStoreImage
    >;
    isRateLimited?: boolean;
  };
  zIndex?: number;
};

export type PreviewImageNodeData = {
  imageUrl: string | null;
  zIndex?: number;
};

export type PreviewTextNodeData = {
  text: string;
  zIndex?: number;
};

/**
 * Force `type: T` to be required, while preserving all other keys from Node<D,T>.
 * Note the `D extends Record<string, unknown>` constraint to match Node's signature.
 */
export type StrictNode<
  D extends Record<string, unknown>,
  T extends string,
> = Omit<Node<D, T>, "type"> & {
  type: T;
};

export type TextEditorNodeType = StrictNode<TextEditorNodeData, "textEditor">;
export type ImageNodeType = StrictNode<ImageNodeData, "image">;
export type CommentNodeType = StrictNode<CommentNodeData, "comment">;
export type PreviewImageNodeType = StrictNode<
  PreviewImageNodeData,
  "previewImage"
>;
export type PreviewTextNodeType = StrictNode<
  PreviewTextNodeData,
  "previewText"
>;

export type AppNode = TextEditorNodeType | ImageNodeType | CommentNodeType;

/**
 * Nodes for the main (normal) whiteboard. Only includes editable/interactive nodes.
 */
export type WhiteboardNode =
  | TextEditorNodeType
  | ImageNodeType
  | CommentNodeType;

/**
 * Nodes for the preview whiteboard. Only includes preview nodes.
 */
export type PreviewNode = PreviewImageNodeType | PreviewTextNodeType;

export type AppEdge = Edge;
