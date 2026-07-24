import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Generates SEO metadata for marketplace products. */
export class ProductSeoWorker extends BaseAIWorker {
  readonly id = AIWorkerId.ProductSeo;
  readonly name = "Product SEO Worker";
  readonly taskTypes = [AITaskType.ProductSeo, AITaskType.ProductEnrich];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  canHandle(taskType: string): boolean {
    return taskType === AITaskType.ProductSeo || taskType === AITaskType.ProductEnrich;
  }

  execute(task: AITask) {
    const productName = readTaskString(task, "productName", "Product");
    const locale = readTaskString(task, "locale", "ru-KG");
    const prompt = `Generate SEO title and meta description for "${productName}" targeting locale ${locale}.`;
    return this.generate(task, prompt, "seo");
  }
}
