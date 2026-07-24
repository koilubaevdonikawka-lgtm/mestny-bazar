import type {
  AggregatedAIJobResult,
  AIJob,
  AIJobResult,
  AIJobStatus,
} from "@server/ports/marketplace-ai.port";

/** Merges per-worker results into a single AI job outcome. */
export class AIResultAggregator {
  aggregate(job: AIJob, workerResults: AIJobResult[]): AggregatedAIJobResult {
    return {
      jobId: job.id,
      status: this.resolveStatus(workerResults),
      workerResults,
      output: Object.fromEntries(workerResults.map((result) => [result.workerId, result.output])),
      completedAt: new Date().toISOString(),
    };
  }

  private resolveStatus(workerResults: AIJobResult[]): AIJobStatus {
    if (workerResults.length === 0) {
      return "skipped";
    }
    if (workerResults.some((result) => result.status === "failed")) {
      return "failed";
    }
    if (workerResults.every((result) => result.status === "skipped")) {
      return "skipped";
    }
    return "completed";
  }
}
