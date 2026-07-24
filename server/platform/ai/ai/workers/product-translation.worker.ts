import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Translates product content for multilingual listings. */
export class ProductTranslationWorker extends BaseAIWorker {
  readonly id = AIWorkerId.ProductTranslation;
  readonly name = "Product Translation Worker";
  readonly taskTypes = [AITaskType.ProductTranslation, AITaskType.ProductEnrich];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  canHandle(taskType: string): boolean {
    return taskType === AITaskType.ProductTranslation || taskType === AITaskType.ProductEnrich;
  }

  execute(task: AITask) {
    const sourceText = readTaskString(task, "sourceText", readTaskString(task, "productName", "Product"));
    const targetLocale = readTaskString(task, "targetLocale", "ky-KG");
    const prompt = `Translate the following marketplace product text to ${targetLocale}: ${sourceText}`;
    return this.generate(task, prompt, "translation");
  }
}
