import { JobEvent } from "@server/jobs/shared";
import type { Job } from "@server/jobs/jobs/job";
import type { QueueEnvelope } from "@server/jobs/queue";

/** Emitted when a job is enqueued for processing. */
export class JobQueuedEvent extends JobEvent {
  readonly eventName = "jobs.job.queued" as const;
  readonly payload: Readonly<{ job: Job; envelope: QueueEnvelope }>;

  constructor(job: Job, envelope: QueueEnvelope, occurredAt?: string) {
    super(occurredAt);
    this.payload = Object.freeze({ job, envelope });
    Object.freeze(this);
  }
}
