// src/core/execution/types.ts

import type { Getter, Setter } from "jotai";
import type {
  AppNode,
  TextEditorNodeType,
  ImageNodeType,
  SpeechNodeType,
  InstructionNodeType,
} from "~/Types/nodes";

/**
 * The context provided to every executor. It contains all necessary state
 * and functions to decide on and perform an action.
 */
export interface ExecutionContext {
  get: Getter;
  set: Setter;
  currentNode: AppNode;
  sourceNodes: (
    | ImageNodeType
    | TextEditorNodeType
    | InstructionNodeType
    | SpeechNodeType
  )[];
}

/**
 * The interface for a self-contained execution strategy.
 */
export interface IExecutor {
  /**
   * Determines if this executor can handle the given context.
   * @param context The current execution context.
   * @returns True if this executor should run, false otherwise.
   */
  canExecute(context: ExecutionContext): boolean;

  /**
   * Performs the operation. This should only be called if canExecute returns true.
   * @param context The current execution context.
   */
  execute(context: ExecutionContext): Promise<void>;
}
