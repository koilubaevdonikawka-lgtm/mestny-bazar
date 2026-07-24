import type { Job } from "@server/jobs/jobs/job";
import type { QueueEnvelope } from "@server/jobs/queue";

/** Record of a job moved to the dead-letter queue. */
export interface DeadLetterEntry {
  readonly id: string;
  readonly job: Job;
  readonly queue: string;
  readonly failedAt: string;
  readonly reason: string;
  readonly attempts: number;
  readonly envelope?: QueueEnvelope;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CreateDeadLetterEntryInput {
  id: string;
  job: Job;
  queue: string;
  reason: string;
  failedAt?: string;
  envelope?: QueueEnvelope;
  metadata?: Readonly<Record<string, unknown>>;
}

/** Creates an immutable dead-letter entry. */
export function createDeadLetterEntry(input: CreateDeadLetterEntryInput): DeadLetterEntry {
  const reason = input.reason?.trim();
  if (!input.id?.trim() || !reason) {
    throw new Error("DeadLetterEntry requires id and reason.");
  }

  return Object.freeze({
    id: input.id.trim(),
    job: input.job.withStatus("dead_letter"),
    queue: input.queue?.trim() || input.job.queue,
    failedAt: input.failedAt ?? new Date().toISOString(),
    reason,
    attempts: input.job.attempts,
    envelope: input.envelope,
    metadata: input.metadata ? Object.freeze({ ...input.metadata }) : undefined,
  });
}

/** In-memory dead-letter store port. */
export interface IDeadLetterStore {
  append(entry: DeadLetterEntry): Promise<void>;
  list(queue?: string): Promise<readonly DeadLetterEntry[]>;
  get(id: string): Promise<DeadLetterEntry | undefined>;
}
