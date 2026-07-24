import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskNumber,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Suggests pricing for marketplace products. */
export class PricingSuggestionWorker extends BaseAIWorker {
  readonly id = AIWorkerId.PricingSuggestion;
  readonly name = "Pricing Suggestion Worker";
  readonly taskTypes = [AITaskType.PricingSuggestion];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  execute(task: AITask) {
    const productName = readTaskString(task, "productName", "Product");
    const currentPrice = readTaskNumber(task, "currentPrice", 0);
    const currency = readTaskString(task, "currency", "KGS");
    const prompt = `Suggest an optimal marketplace price for "${productName}" with current price ${currentPrice} ${currency}.`;
    return this.generate(task, prompt, "pricing");
  }
}
