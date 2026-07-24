import {
  createDeadLetterEntry,
  type DeadLetterEntry,
  type IDeadLetterStore,
} from "@server/jobs/dead-letter/dead-letter-entry";
import type { QueueEnvelope } from "@server/jobs/queue";

/** Manages jobs that exceeded retry limits or failed permanently. */
export class DeadLetterQueue {
  private readonly entries: DeadLetterEntry[] = [];

  constructor(private readonly store?: IDeadLetterStore) {
    Object.freeze(this);
  }

  async move(envelope: QueueEnvelope, reason: string): Promise<DeadLetterEntry> {
    const entry = createDeadLetterEntry({
      id: `dlq-${envelope.job.id.toString()}-${Date.now()}`,
      job: envelope.job,
      queue: envelope.queue,
      reason,
      envelope,
    });

    if (this.store) {
      await this.store.append(entry);
    } else {
      this.entries.push(entry);
    }

    return entry;
  }

  async list(queue?: string): Promise<readonly DeadLetterEntry[]> {
    if (this.store) {
      return this.store.list(queue);
    }

    return Object.freeze(
      queue ? this.entries.filter((entry) => entry.queue === queue) : [...this.entries],
    );
  }
}

export type { DeadLetterEntry, IDeadLetterStore } from "@server/jobs/dead-letter/dead-letter-entry";
export { createDeadLetterEntry } from "@server/jobs/dead-letter/dead-letter-entry";
