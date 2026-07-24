import type { Job } from "@server/jobs/jobs/job";
import type { JobId } from "@server/jobs/jobs/job-id";
import type { JobPayload } from "@server/jobs/jobs/job-payload";
import type { JobPriority } from "@server/jobs/jobs/job-priority";

/** Message placed on a queue for worker consumption. */
export interface QueueMessage {
  readonly id: string;
  readonly jobId: JobId;
  readonly payload: JobPayload;
  readonly priority: JobPriority;
  readonly enqueuedAt: string;
  readonly visibleAfter?: string;
  readonly attempt: number;
}

/** Creates an immutable queue message. */
export function createQueueMessage(input: QueueMessage): QueueMessage {
  return Object.freeze({
    id: input.id,
    jobId: input.jobId,
    payload: input.payload,
    priority: input.priority,
    enqueuedAt: input.enqueuedAt,
    visibleAfter: input.visibleAfter,
    attempt: input.attempt,
  });
}

/** Wraps a queue message with routing and acknowledgement metadata. */
export interface QueueEnvelope {
  readonly queue: string;
  readonly message: QueueMessage;
  readonly job: Job;
  readonly receiptHandle?: string;
}

/** Creates an immutable queue envelope. */
export function createQueueEnvelope(input: QueueEnvelope): QueueEnvelope {
  return Object.freeze({
    queue: input.queue,
    message: input.message,
    job: input.job,
    receiptHandle: input.receiptHandle,
  });
}

/** Result of processing a queue message. */
export type QueueResult = "ack" | "nack" | "retry";

export interface QueueProcessResult {
  readonly result: QueueResult;
  readonly reason?: string;
}

/** Creates a queue process result. */
export function createQueueProcessResult(
  result: QueueResult,
  reason?: string,
): QueueProcessResult {
  return Object.freeze({
    result,
    reason: reason?.trim() || undefined,
  });
}
