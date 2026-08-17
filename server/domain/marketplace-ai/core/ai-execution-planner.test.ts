import { describe, expect, it } from "vitest";
import { AIExecutionPlanner } from "@server/domain/marketplace-ai/core/ai-execution-planner";
import { AIWorkerRegistry } from "@server/domain/marketplace-ai/ai-worker-registry";
import type { AIJob, IAIWorker } from "@server/ports/marketplace-ai.port";
import type { MarketplaceEvent } from "@server/ports/marketplace-events.port";

function fakeWorker(id: string, canHandle: boolean): IAIWorker {
  return {
    id,
    canHandle: () => canHandle,
    process: async () => ({
      jobId: "job-1",
      workerId: id,
      status: "completed",
      output: {},
      processedAt: new Date().toISOString(),
    }),
  };
}

function fakeJob(overrides: Partial<AIJob> = {}): AIJob {
  return {
    id: "job-1",
    event: { type: "order.created" } as unknown as MarketplaceEvent,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("AIExecutionPlanner", () => {
  it("includes only workers that can handle the job's event", () => {
    const registry = new AIWorkerRegistry();
    registry.register(fakeWorker("catalog-worker", true));
    registry.register(fakeWorker("media-worker", false));
    const planner = new AIExecutionPlanner(registry);

    const plan = planner.plan(fakeJob());

    expect(plan.workerIds).toEqual(["catalog-worker"]);
  });

  it("returns an empty plan when no workers can handle the event", () => {
    const registry = new AIWorkerRegistry();
    registry.register(fakeWorker("media-worker", false));
    const planner = new AIExecutionPlanner(registry);

    const plan = planner.plan(fakeJob());

    expect(plan.workerIds).toEqual([]);
  });

  it("carries the job id and always plans for parallel execution", () => {
    const registry = new AIWorkerRegistry();
    registry.register(fakeWorker("catalog-worker", true));
    const planner = new AIExecutionPlanner(registry);

    const plan = planner.plan(fakeJob({ id: "job-42" }));

    expect(plan.jobId).toBe("job-42");
    expect(plan.mode).toBe("parallel");
  });
});
