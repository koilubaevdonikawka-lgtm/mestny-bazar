/** Execution plan produced by AIExecutionPlanner. */
export interface AIExecutionPlan {
  readonly taskId: string;
  readonly workerIds: readonly string[];
  readonly aggregationKeys: readonly string[];
  readonly mode: "sequential";
}

export function createAIExecutionPlan(input: {
  taskId: string;
  workerIds: readonly string[];
  aggregationKeys?: readonly string[];
}): AIExecutionPlan {
  return Object.freeze({
    taskId: input.taskId,
    workerIds: Object.freeze([...input.workerIds]),
    aggregationKeys: Object.freeze([...(input.aggregationKeys ?? input.workerIds)]),
    mode: "sequential",
  });
}
