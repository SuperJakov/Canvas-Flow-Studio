import DefaultEdge from "../_components/edges/DefaultEdge";
import CommentNode from "../_components/nodes/CommentNode";
import ImageNode from "../_components/nodes/ImageNode";
import TextEditorNode from "../_components/nodes/TextEditor";

export const nodeTypes = {
  textEditor: TextEditorNode,
  image: ImageNode,
  comment: CommentNode,
} as const;

export const edgeTypes = {
  default: DefaultEdge,
} as const;
