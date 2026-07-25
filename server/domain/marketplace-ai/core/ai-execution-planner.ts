import type { AIJob, ExecutionPlan } from "@server/ports/marketplace-ai.port";
import type { AIWorkerRegistry } from "@server/domain/marketplace-ai/ai-worker-registry";

/** Builds an execution plan from registered workers able to handle the job's event. */
export class AIExecutionPlanner {
  constructor(private readonly registry: AIWorkerRegistry) {}

  plan(job: AIJob): ExecutionPlan {
    const workerIds = this.registry
      .getWorkers()
      .filter((worker) => worker.canHandle(job.event))
      .map((worker) => worker.id);

    return {
      jobId: job.id,
      workerIds,
      mode: "parallel",
    };
  }
}
