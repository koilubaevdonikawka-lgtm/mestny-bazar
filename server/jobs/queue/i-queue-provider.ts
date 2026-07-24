import type { Job } from "@server/jobs/jobs/job";
import type {
  QueueEnvelope,
  QueueProcessResult,
} from "@server/jobs/queue/queue-message";

/** Queue operations port — implementations live in infrastructure. */
export interface IQueueProvider {
  enqueue(queue: string, job: Job): Promise<QueueEnvelope>;
  dequeue(queue: string): Promise<QueueEnvelope | null>;
  ack(envelope: QueueEnvelope): Promise<void>;
  nack(envelope: QueueEnvelope, result: QueueProcessResult): Promise<void>;
  requeue(envelope: QueueEnvelope, delayMs?: number): Promise<QueueEnvelope>;
  depth(queue: string): Promise<number>;
}
