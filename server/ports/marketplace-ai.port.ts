import type { MarketplaceEvent } from "@server/ports/marketplace-events.port";

export interface AIJob {
  id: string;
  event: MarketplaceEvent;
  createdAt: string;
}

export type AIJobStatus = "completed" | "skipped" | "failed";

export interface AIJobResult {
  jobId: string;
  workerId: string;
  status: AIJobStatus;
  output: Record<string, unknown>;
  processedAt: string;
}

/** Unified result after all workers in a plan have run. */
export interface AggregatedAIJobResult {
  jobId: string;
  status: AIJobStatus;
  workerResults: AIJobResult[];
  output: Record<string, unknown>;
  completedAt: string;
}

/** Sequential execution plan for a single AI job. */
export interface ExecutionPlan {
  jobId: string;
  workerIds: string[];
  mode: "sequential";
}

export interface IAIWorker {
  readonly id: string;
  canHandle(event: MarketplaceEvent): boolean;
  process(job: AIJob): Promise<AIJobResult>;
}
