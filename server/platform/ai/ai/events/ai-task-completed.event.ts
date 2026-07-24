import type { AIResponse } from "@server/platform/ai/ai/models";

export interface AITaskCompletedEvent {
  readonly type: "ai.task.completed";
  readonly response: AIResponse;
  readonly occurredAt: string;
}

export function createAITaskCompletedEvent(response: AIResponse): AITaskCompletedEvent {
  return Object.freeze({
    type: "ai.task.completed",
    response,
    occurredAt: new Date().toISOString(),
  });
}
