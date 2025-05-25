import { atom } from "jotai";
import { type AppEdge, type AppNode } from "~/Types/nodes";
import { initialEdges, initialNodes } from "./initial";

export const nodesAtom = atom<AppNode[]>([]);
export const edgesAtom = atom<AppEdge[]>([]); // Edges can be added later if needed

export const updateNodeDataAtom = atom(
  null,
  (
    get,
    set,
    {
      nodeId,
      nodeType,
      updatedData,
    }: {
      nodeId: string;
      nodeType: AppNode["type"];
      updatedData: Partial<AppNode["data"]>;
    },
  ) => {
    const nodes = get(nodesAtom);
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId && node.type === nodeType
        ? { ...node, data: { ...node.data, ...updatedData } }
        : node,
    );
    set(nodesAtom, updatedNodes);
  },
);
