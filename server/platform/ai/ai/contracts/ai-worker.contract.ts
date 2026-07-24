import type { AITask } from "@server/platform/ai/ai/models";
import type { AIWorkerResult } from "@server/platform/ai/ai/models/ai-worker-result.model";

/** Contract for platform AI workers. */
export interface IAIWorker {
  readonly id: string;
  readonly name: string;
  canHandle(taskType: string): boolean;
  execute(task: AITask): Promise<AIWorkerResult>;
}
