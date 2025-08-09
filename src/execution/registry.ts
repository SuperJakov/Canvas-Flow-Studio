// src/core/execution/registry.ts

import type { IExecutor, ExecutionContext } from "./types";
import { imageGenerationExecutor } from "./ImageGenerationExecutor";
import { speechGenerationExecutor } from "./SpeechGenerationExecutor";
import { textModificationExecutor } from "./TextModificationExecutor";
import { instructionNodeExecutor } from "./InstructionNodeExecutor";
import { imageDescriptionExecutor } from "./ImageDescriptionExecutor";
import { websiteGenerationExecutor } from "./WebsiteGenerationExecutor";

const executorRegistry: IExecutor[] = [
  // More specific executors should come first to be matched first.
  textModificationExecutor,
  imageDescriptionExecutor,

  // General-purpose executors
  imageGenerationExecutor,
  speechGenerationExecutor,
  websiteGenerationExecutor,
  instructionNodeExecutor,
];

export function findExecutor(context: ExecutionContext): IExecutor | undefined {
  return executorRegistry.find((executor) => executor.canExecute(context));
}
