import { JobEvent } from "@server/jobs/shared";
import type { JobContext } from "@server/jobs/context";
import type { RetryContext } from "@server/jobs/retry";

/** Emitted when a failed job is scheduled for retry. */
export class JobRetriedEvent extends JobEvent {
  readonly eventName = "jobs.job.retried" as const;
  readonly payload: Readonly<{ context: JobContext; retry: RetryContext; retryAt: string }>;

  constructor(
    context: JobContext,
    retry: RetryContext,
    retryAt: string,
    occurredAt?: string,
  ) {
    super(occurredAt);
    this.payload = Object.freeze({ context, retry, retryAt });
    Object.freeze(this);
  }
}
