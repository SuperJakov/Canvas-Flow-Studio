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

export type GenerateAndStoreSpeechAction = ReactAction<
  typeof api.speechNodes.generateAndStoreSpeech
>;

const speechActionMap = new Map<string, GenerateAndStoreSpeechAction>();

export function registerSpeechAction(
  nodeId: string,
  fn: GenerateAndStoreSpeechAction,
) {
  speechActionMap.set(nodeId, fn);
}

export function unregisterSpeechAction(nodeId: string) {
  speechActionMap.delete(nodeId);
}

export function getSpeechAction(nodeId: string) {
  return speechActionMap.get(nodeId);
}

const textActionMap = new Map<
  string,
  ReactAction<typeof api.textNodes.modifyText>
>();

export function registerTextAction(
  nodeId: string,
  fn: ReactAction<typeof api.textNodes.modifyText>,
) {
  textActionMap.set(nodeId, fn);
}

export function unregisterTextAction(nodeId: string) {
  textActionMap.delete(nodeId);
}

export function getTextAction(nodeId: string) {
  return textActionMap.get(nodeId);
}

const imageDescriptionActionMap = new Map<
  string,
  ReactAction<typeof api.textNodes.describeImages>
>();

export function registerImageDescriptionAction(
  nodeId: string,
  fn: ReactAction<typeof api.textNodes.describeImages>,
) {
  imageDescriptionActionMap.set(nodeId, fn);
}

export function unregisterImageDescriptionAction(nodeId: string) {
  imageDescriptionActionMap.delete(nodeId);
}

export function getImageDescriptionAction(nodeId: string) {
  return imageDescriptionActionMap.get(nodeId);
}

export type GenerateAndStoreWebsiteAction = ReactAction<
  typeof api.websiteNodes.generateAndStoreWebsite
>;

const websiteActionMap = new Map<string, GenerateAndStoreWebsiteAction>();

export function registerWebsiteAction(
  nodeId: string,
  fn: GenerateAndStoreWebsiteAction,
) {
  websiteActionMap.set(nodeId, fn);
}

export function unregisterWebsiteAction(nodeId: string) {
  websiteActionMap.delete(nodeId);
}

export function getWebsiteAction(nodeId: string) {
  return websiteActionMap.get(nodeId);
}
