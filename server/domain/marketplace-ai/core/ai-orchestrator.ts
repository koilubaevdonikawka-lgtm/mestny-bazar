import type { AggregatedAIJobResult, AIJob, AIJobResult } from "@server/ports/marketplace-ai.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { AIWorkerRegistry } from "@server/domain/marketplace-ai/ai-worker-registry";
import type { AIExecutionPlanner } from "@server/domain/marketplace-ai/core/ai-execution-planner";
import type { AIResultAggregator } from "@server/domain/marketplace-ai/core/ai-result-aggregator";

/** Coordinates AI job planning, worker execution, aggregation, and completion events. */
export class AIOrchestrator {
  constructor(
    private readonly planner: AIExecutionPlanner,
    private readonly registry: AIWorkerRegistry,
    private readonly aggregator: AIResultAggregator,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async run(job: AIJob): Promise<AggregatedAIJobResult> {
    const plan = this.planner.plan(job);
    const workerResults = await this.executePlan(job, plan.workerIds);
    const result = this.aggregator.aggregate(job, workerResults);

    await this.events.publish({
      type: "ai.job.completed",
      job,
      result,
    });

    return result;
  }

  private async executePlan(job: AIJob, workerIds: string[]): Promise<AIJobResult[]> {
    const results: AIJobResult[] = [];

    for (const workerId of workerIds) {
      const worker = this.registry.getWorker(workerId);
      if (worker) {
        results.push(await worker.process(job));
      }
    }

    return results;
  }
}
