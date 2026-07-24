import type { AITask } from "@server/platform/ai/ai/models";

export interface AITaskStartedEvent {
  readonly type: "ai.task.started";
  readonly task: AITask;
  readonly workerIds: readonly string[];
  readonly occurredAt: string;
}

export function createAITaskStartedEvent(
  task: AITask,
  workerIds: readonly string[],
): AITaskStartedEvent {
  return Object.freeze({
    type: "ai.task.started",
    task,
    workerIds: Object.freeze([...workerIds]),
    occurredAt: new Date().toISOString(),
  });
}
