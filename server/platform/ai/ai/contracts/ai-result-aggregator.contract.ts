import type { AITask, AIResponse } from "@server/platform/ai/ai/models";
import type { AIWorkerResult } from "@server/platform/ai/ai/models/ai-worker-result.model";

/** Aggregates worker outputs into a unified AI response. */
export interface IAIResultAggregator {
  aggregate(task: AITask, workerResults: readonly AIWorkerResult[]): AIResponse;
}
