import type { AggregatedAIJobResult, AIJob, AIJobResult } from "@server/ports/marketplace-ai.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { AIWorkerRegistry } from "@server/domain/marketplace-ai/ai-worker-registry";
import type { AIExecutionPlanner } from "@server/domain/marketplace-ai/core/ai-execution-planner";
import type { AIResultAggregator } from "@server/domain/marketplace-ai/core/ai-result-aggregator";
import { logger } from "@shared/observability/logger";

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

  /**
   * Runs every worker in the plan concurrently — each worker only reads from
   * the triggering event (see IAIWorker.process), so there is no ordering or
   * data dependency between them, and this event is on the seller's publish
   * request's critical path (SellerProductService awaits
   * events.publish("product.published"), which this orchestrator is
   * subscribed to — Этап 5 retargeting, see ai.md). Running workers one at a
   * time only added latency to that request with no correctness benefit.
   *
   * A worker throwing must not stop the plan: every other worker still runs,
   * and the job still completes (with a "failed" entry for that worker) —
   * IAIWorker.process() has no obligation to catch its own errors, and
   * AIJobStatus already has a "failed" value the aggregator understands.
   */
  private async executePlan(job: AIJob, workerIds: string[]): Promise<AIJobResult[]> {
    const settled = await Promise.allSettled(
      workerIds.map((workerId) => this.runWorker(job, workerId)),
    );

    const results: AIJobResult[] = [];
    settled.forEach((outcome, index) => {
      if (outcome.status === "fulfilled") {
        if (outcome.value) results.push(outcome.value);
        return;
      }
      const workerId = workerIds[index]!;
      logger.error("AI worker failed", { workerId, jobId: job.id, error: outcome.reason });
      results.push({
        jobId: job.id,
        workerId,
        status: "failed",
        output: {
          error: outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
        },
        processedAt: new Date().toISOString(),
      });
    });

    return results;
  }

  private async runWorker(job: AIJob, workerId: string): Promise<AIJobResult | undefined> {
    const worker = this.registry.getWorker(workerId);
    if (!worker) return undefined;
    return worker.process(job);
  }
}
