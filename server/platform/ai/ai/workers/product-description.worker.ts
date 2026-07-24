import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Generates marketplace product descriptions. */
export class ProductDescriptionWorker extends BaseAIWorker {
  readonly id = AIWorkerId.ProductDescription;
  readonly name = "Product Description Worker";
  readonly taskTypes = [AITaskType.ProductDescription, AITaskType.ProductEnrich];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  canHandle(taskType: string): boolean {
    return taskType === AITaskType.ProductDescription || taskType === AITaskType.ProductEnrich;
  }

  execute(task: AITask) {
    const productName = readTaskString(task, "productName", "Product");
    const category = readTaskString(task, "category", "general");
    const prompt = `Write a concise marketplace product description for "${productName}" in category "${category}".`;
    return this.generate(task, prompt, "description");
  }
}
