import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import { AITaskType, AIWorkerId } from "@server/platform/ai/ai/planner/ai-task-types";
import {
  BaseAIWorker,
  readTaskString,
} from "@server/platform/ai/ai/workers/base-ai.worker";
import type { AITask } from "@server/platform/ai/ai/models";

/** Produces analytics insights from aggregated marketplace metrics. */
export class AnalyticsInsightWorker extends BaseAIWorker {
  readonly id = AIWorkerId.AnalyticsInsight;
  readonly name = "Analytics Insight Worker";
  readonly taskTypes = [AITaskType.AnalyticsInsight];

  constructor(provider: IAIProvider) {
    super(provider);
  }

  execute(task: AITask) {
    const metricScope = readTaskString(task, "metricScope", "marketplace");
    const metrics = readTaskString(task, "metricsSummary", "{}");
    const prompt = `Summarize actionable ${metricScope} analytics insights from metrics: ${metrics}`;
    return this.generate(task, prompt, "insights");
  }
}
