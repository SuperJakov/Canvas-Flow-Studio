import { atom } from "jotai";
import { type AppEdge, type AppNode } from "~/Types/nodes";
import { executeNodeLogic } from "./execution";

export const nodesAtom = atom<AppNode[]>([]);
export const edgesAtom = atom<AppEdge[]>([]); // Edges can be added later if needed

export const isExecutingNodeAtom = atom(false); // Global flag to indicate if a node is being executed

export const executeNodeAtom = atom(
  null,
  (
    get,
    set,
    {
      nodeId,
    }: {
      nodeId: string;
    },
  ) => {
    void executeNodeLogic(get, set, nodeId).then(() => {
      set(isExecutingNodeAtom, false);
    });
  },
);

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
