import { JobEvent } from "@server/jobs/shared";
import type { JobContext } from "@server/jobs/context";
import type { WorkerResult } from "@server/jobs/workers";

/** Emitted when a job completes successfully. */
export class JobCompletedEvent extends JobEvent {
  readonly eventName = "jobs.job.completed" as const;
  readonly payload: Readonly<{ context: JobContext; result: WorkerResult }>;

  constructor(context: JobContext, result: WorkerResult, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ context, result });
    Object.freeze(this);
  }
}
