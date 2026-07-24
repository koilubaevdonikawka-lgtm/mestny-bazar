import type { AIWorkerStatusValue } from "@server/platform/ai/ai/models/ai-task.model";
import type { AIWorkerResult } from "@server/platform/ai/ai/models/ai-worker-result.model";

/** Aggregated AI orchestrator response. */
export interface AIResponse {
  readonly taskId: string;
  readonly status: AIWorkerStatusValue;
  readonly output: Readonly<Record<string, unknown>>;
  readonly workerResults: readonly AIWorkerResult[];
  readonly completedAt: string;
}

export function createAIResponse(input: {
  taskId: string;
  status: AIWorkerStatusValue;
  output?: Readonly<Record<string, unknown>>;
  workerResults: readonly AIWorkerResult[];
}): AIResponse {
  return Object.freeze({
    taskId: input.taskId,
    status: input.status,
    output: Object.freeze({ ...(input.output ?? {}) }),
    workerResults: Object.freeze([...input.workerResults]),
    completedAt: new Date().toISOString(),
  });
}
