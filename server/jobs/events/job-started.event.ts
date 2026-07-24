import { JobEvent } from "@server/jobs/shared";
import type { JobContext } from "@server/jobs/context";

/** Emitted when a job begins processing. */
export class JobStartedEvent extends JobEvent {
  readonly eventName = "jobs.job.started" as const;
  readonly payload: Readonly<{ context: JobContext }>;

  constructor(context: JobContext, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ context });
    Object.freeze(this);
  }
}
