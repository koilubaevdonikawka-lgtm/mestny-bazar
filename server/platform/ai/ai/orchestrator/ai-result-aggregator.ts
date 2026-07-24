import type { IAIResultAggregator } from "@server/platform/ai/ai/contracts";
import {
  AIWorkerStatus,
  createAIResponse,
  type AITask,
  type AIResponse,
} from "@server/platform/ai/ai/models";
import type { AIWorkerResult } from "@server/platform/ai/ai/models/ai-worker-result.model";

/** Default aggregator merging worker outputs into a single AI response. */
export class AIResultAggregator implements IAIResultAggregator {
  aggregate(task: AITask, workerResults: readonly AIWorkerResult[]): AIResponse {
    const output: Record<string, unknown> = {
      taskType: task.type,
    };

    for (const result of workerResults) {
      output[result.workerId] = result.output;
    }

    return createAIResponse({
      taskId: task.id,
      status: this.resolveStatus(workerResults),
      output,
      workerResults,
    });
  }

  private resolveStatus(workerResults: readonly AIWorkerResult[]): typeof AIWorkerStatus.Completed | typeof AIWorkerStatus.Skipped | typeof AIWorkerStatus.Failed {
    if (workerResults.length === 0) {
      return AIWorkerStatus.Skipped;
    }
    if (workerResults.some((result) => result.status === AIWorkerStatus.Failed)) {
      return AIWorkerStatus.Failed;
    }
    if (workerResults.every((result) => result.status === AIWorkerStatus.Skipped)) {
      return AIWorkerStatus.Skipped;
    }
    return AIWorkerStatus.Completed;
  }
}
