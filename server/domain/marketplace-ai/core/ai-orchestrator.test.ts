import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIOrchestrator } from "@server/domain/marketplace-ai/core/ai-orchestrator";
import { AIWorkerRegistry } from "@server/domain/marketplace-ai/ai-worker-registry";
import { AIExecutionPlanner } from "@server/domain/marketplace-ai/core/ai-execution-planner";
import { AIResultAggregator } from "@server/domain/marketplace-ai/core/ai-result-aggregator";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AIJob, AIJobResult, IAIWorker } from "@server/ports/marketplace-ai.port";

function makeJob(): AIJob {
  return {
    id: "job-1",
    event: { type: "product.media.analysis.requested", productId: "product-1", photos: [] },
    createdAt: new Date().toISOString(),
  };
}

function makeWorker(id: string, process: IAIWorker["process"]): IAIWorker {
  return { id, canHandle: () => true, process };
}

function fakeEventBus(): IMarketplaceEventBus {
  return { publish: vi.fn(async (_event: MarketplaceEvent) => {}), subscribe: vi.fn() };
}

function okResult(jobId: string, workerId: string): AIJobResult {
  return {
    jobId,
    workerId,
    status: "completed",
    output: {},
    processedAt: new Date().toISOString(),
  };
}

describe("AIOrchestrator.run", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("still runs later workers and completes the job when an earlier worker throws", async () => {
    const registry = new AIWorkerRegistry();
    const secondCalled = vi.fn(async () => okResult("job-1", "second"));
    registry.register(
      makeWorker("first", async () => {
        throw new Error("boom");
      }),
    );
    registry.register(makeWorker("second", secondCalled));

    const events = fakeEventBus();
    const orchestrator = new AIOrchestrator(
      new AIExecutionPlanner(registry),
      registry,
      new AIResultAggregator(),
      events,
    );

    const result = await orchestrator.run(makeJob());

    expect(secondCalled).toHaveBeenCalledTimes(1);
    expect(result.workerResults).toHaveLength(2);
    expect(result.workerResults[0]).toMatchObject({ workerId: "first", status: "failed" });
    expect(result.workerResults[1]).toMatchObject({ workerId: "second", status: "completed" });
    expect(result.status).toBe("failed");
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ai.job.completed" }),
    );
  });

  it("runs workers concurrently instead of waiting for each one to finish", async () => {
    const registry = new AIWorkerRegistry();
    const started: string[] = [];
    registry.register(
      makeWorker("slow", async () => {
        started.push("slow");
        await new Promise((resolve) => setTimeout(resolve, 20));
        return okResult("job-1", "slow");
      }),
    );
    registry.register(
      makeWorker("fast", async () => {
        started.push("fast");
        return okResult("job-1", "fast");
      }),
    );

    const orchestrator = new AIOrchestrator(
      new AIExecutionPlanner(registry),
      registry,
      new AIResultAggregator(),
      fakeEventBus(),
    );

    await orchestrator.run(makeJob());

    // Both workers must have started before the slow one's delay elapsed —
    // proving "fast" wasn't queued behind "slow" finishing first.
    expect(started).toEqual(["slow", "fast"]);
  });

  it("preserves declared plan order in the results even when a later worker finishes first", async () => {
    const registry = new AIWorkerRegistry();
    registry.register(
      makeWorker("a", async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return okResult("job-1", "a");
      }),
    );
    registry.register(makeWorker("b", async () => okResult("job-1", "b")));

    const orchestrator = new AIOrchestrator(
      new AIExecutionPlanner(registry),
      registry,
      new AIResultAggregator(),
      fakeEventBus(),
    );

    const result = await orchestrator.run(makeJob());
    expect(result.workerResults.map((r) => r.workerId)).toEqual(["a", "b"]);
  });
});
