import { atom } from "jotai";
import type { AppNode } from "~/Types/nodes";

export const nodesAtom = atom<AppNode[]>([]);
