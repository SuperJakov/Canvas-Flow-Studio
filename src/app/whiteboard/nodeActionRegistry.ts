import { type api } from "convex/_generated/api";
import { type ReactAction } from "convex/react";

// nodeActionRegistry.ts
export type GenerateAndStoreImageAction = ReactAction<
  typeof api.imageNodes.generateAndStoreImage
>;

const imageActionMap = new Map<string, GenerateAndStoreImageAction>();

export function registerImageAction(
  nodeId: string,
  fn: GenerateAndStoreImageAction,
) {
  imageActionMap.set(nodeId, fn);
}

export function unregisterImageAction(nodeId: string) {
  imageActionMap.delete(nodeId);
}

export function getImageAction(nodeId: string) {
  return imageActionMap.get(nodeId);
}
