import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Drafts support assistant replies for customer tickets. */
export class SupportAssistantWorker extends BaseAIWorker {
  readonly id = AIWorkerId.SupportAssistant;
  readonly name = "Support Assistant Worker";
  readonly taskTypes = [AITaskType.SupportAssistant];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  execute(task: AITask) {
    const subject = readTaskString(task, "subject", "Support request");
    const message = readTaskString(task, "message", "");
    const prompt = `Draft a helpful support reply for ticket "${subject}": ${message}`;
    return this.generate(task, prompt, "reply");
  }
}
