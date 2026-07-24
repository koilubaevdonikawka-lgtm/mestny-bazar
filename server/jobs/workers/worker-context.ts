import type { JobContext } from "@server/jobs/context/job-context";
import type { Job } from "@server/jobs/jobs/job";

/** Execution context passed to workers during job processing. */
export interface WorkerContext {
  readonly job: Job;
  readonly context: JobContext;
  readonly attempt: number;
  readonly startedAt: string;
}

/** Creates an immutable worker context. */
export function createWorkerContext(input: WorkerContext): WorkerContext {
  return Object.freeze({ ...input });
}

/** Outcome of a worker processing a job. */
export type WorkerResultStatus = "completed" | "failed" | "retry";

export interface WorkerResult {
  readonly status: WorkerResultStatus;
  readonly output?: unknown;
  readonly error?: string;
  readonly durationMs?: number;
}

/** Creates an immutable worker result. */
export function createWorkerResult(input: WorkerResult): WorkerResult {
  return Object.freeze({
    status: input.status,
    output: input.output,
    error: input.error?.trim() || undefined,
    durationMs: input.durationMs,
  });
}
