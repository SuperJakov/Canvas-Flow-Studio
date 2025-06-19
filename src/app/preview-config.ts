import PreviewTextNode from "./_components/nodes/PreviewTextNode";
import PreviewImageNode from "./_components/nodes/PreviewImageNode";

export const previewNodeTypes = {
  textEditor: PreviewTextNode,
  previewImage: PreviewImageNode,
} as const;
