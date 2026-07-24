import type { AIWorkerResult } from "@server/platform/ai/ai/models/ai-worker-result.model";

export interface AIWorkerCompletedEvent {
  readonly type: "ai.worker.completed";
  readonly result: AIWorkerResult;
  readonly occurredAt: string;
}

export function createAIWorkerCompletedEvent(result: AIWorkerResult): AIWorkerCompletedEvent {
  return Object.freeze({
    type: "ai.worker.completed",
    result,
    occurredAt: new Date().toISOString(),
  });
}
