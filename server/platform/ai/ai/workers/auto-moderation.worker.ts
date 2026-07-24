import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Suggests moderation decisions for marketplace content. */
export class AutoModerationWorker extends BaseAIWorker {
  readonly id = AIWorkerId.AutoModeration;
  readonly name = "Auto Moderation Worker";
  readonly taskTypes = [AITaskType.AutoModeration];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  execute(task: AITask) {
    const targetType = readTaskString(task, "targetType", "listing");
    const content = readTaskString(task, "content", "");
    const prompt = `Review ${targetType} content for marketplace policy compliance and return approve/reject with rationale: ${content}`;
    return this.generate(task, prompt, "moderation");
  }
}
