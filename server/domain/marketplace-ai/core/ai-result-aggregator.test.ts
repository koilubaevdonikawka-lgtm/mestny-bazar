import { describe, expect, it } from "vitest";
import { AIResultAggregator } from "@server/domain/marketplace-ai/core/ai-result-aggregator";
import type { AIJob, AIJobResult, AIJobStatus } from "@server/ports/marketplace-ai.port";
import type { MarketplaceEvent } from "@server/ports/marketplace-events.port";

function fakeJob(): AIJob {
  return {
    id: "job-1",
    event: { type: "order.created" } as unknown as MarketplaceEvent,
    createdAt: new Date().toISOString(),
  };
}

function fakeResult(
  workerId: string,
  status: AIJobStatus,
  output: Record<string, unknown> = {},
): AIJobResult {
  return { jobId: "job-1", workerId, status, output, processedAt: new Date().toISOString() };
}

describe("AIResultAggregator", () => {
  const aggregator = new AIResultAggregator();

  it("resolves to skipped when there are no worker results", () => {
    const result = aggregator.aggregate(fakeJob(), []);
    expect(result.status).toBe("skipped");
  });

  it("resolves to completed when every worker completed", () => {
    const result = aggregator.aggregate(fakeJob(), [
      fakeResult("catalog-worker", "completed"),
      fakeResult("media-worker", "completed"),
    ]);
    expect(result.status).toBe("completed");
  });

  it("resolves to skipped when every worker was skipped", () => {
    const result = aggregator.aggregate(fakeJob(), [
      fakeResult("catalog-worker", "skipped"),
      fakeResult("media-worker", "skipped"),
    ]);
    expect(result.status).toBe("skipped");
  });

  it("resolves to failed if any worker failed, even if others completed", () => {
    const result = aggregator.aggregate(fakeJob(), [
      fakeResult("catalog-worker", "completed"),
      fakeResult("media-worker", "failed"),
    ]);
    expect(result.status).toBe("failed");
  });

  it("prioritizes failed over skipped when the results are mixed", () => {
    const result = aggregator.aggregate(fakeJob(), [
      fakeResult("catalog-worker", "skipped"),
      fakeResult("media-worker", "failed"),
    ]);
    expect(result.status).toBe("failed");
  });

  it("resolves to completed when results mix completed and skipped (not all skipped)", () => {
    const result = aggregator.aggregate(fakeJob(), [
      fakeResult("catalog-worker", "completed"),
      fakeResult("media-worker", "skipped"),
    ]);
    expect(result.status).toBe("completed");
  });

  it("keys output by workerId and carries the job id through", () => {
    const result = aggregator.aggregate(fakeJob(), [
      fakeResult("catalog-worker", "completed", { score: 9 }),
      fakeResult("media-worker", "completed", { score: 7 }),
    ]);

    expect(result.jobId).toBe("job-1");
    expect(result.output).toEqual({
      "catalog-worker": { score: 9 },
      "media-worker": { score: 7 },
    });
    expect(result.workerResults).toHaveLength(2);
  });
});
