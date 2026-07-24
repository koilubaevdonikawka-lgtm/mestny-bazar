import {
  AIWorkerStatus,
  type AIWorkerStatusValue,
} from "@server/platform/ai/ai/models/ai-task.model";

/** Result produced by a single AI worker. */
export interface AIWorkerResult {
  readonly taskId: string;
  readonly workerId: string;
  readonly status: AIWorkerStatusValue;
  readonly output: Readonly<Record<string, unknown>>;
  readonly processedAt: string;
}

export function createAIWorkerResult(input: {
  taskId: string;
  workerId: string;
  status?: AIWorkerStatusValue;
  output?: Readonly<Record<string, unknown>>;
}): AIWorkerResult {
  return Object.freeze({
    taskId: input.taskId,
    workerId: input.workerId,
    status: input.status ?? AIWorkerStatus.Completed,
    output: Object.freeze({ ...(input.output ?? {}) }),
    processedAt: new Date().toISOString(),
  });
}

export { AIWorkerStatus };
