import { JobEvent } from "@server/jobs/shared";
import type { JobContext } from "@server/jobs/context";

/** Emitted when a job fails during processing. */
export class JobFailedEvent extends JobEvent {
  readonly eventName = "jobs.job.failed" as const;
  readonly payload: Readonly<{ context: JobContext; error: string }>;

  constructor(context: JobContext, error: string, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ context, error: error.trim() });
    Object.freeze(this);
  }
}
