import { JobId } from "@server/jobs/jobs/job-id";
import type { JobPayload } from "@server/jobs/jobs/job-payload";
import type { JobPriority } from "@server/jobs/jobs/job-priority";
import { parseJobPriority } from "@server/jobs/jobs/job-priority";
import type { JobStatus } from "@server/jobs/jobs/job-status";

export interface JobProps {
  id?: JobId;
  name: string;
  payload: JobPayload;
  status?: JobStatus;
  priority?: JobPriority;
  queue?: string;
  createdAt?: string;
  updatedAt?: string;
  attempts?: number;
  maxAttempts?: number;
  scheduledAt?: string;
  correlationId?: string;
  metadata?: Readonly<Record<string, unknown>>;
}

/** Immutable background job domain model. */
export class Job {
  readonly id: JobId;
  readonly name: string;
  readonly payload: JobPayload;
  readonly status: JobStatus;
  readonly priority: JobPriority;
  readonly queue: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly scheduledAt?: string;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;

  private constructor(props: Required<Omit<JobProps, "id" | "scheduledAt" | "correlationId" | "metadata">> & {
    id: JobId;
    scheduledAt?: string;
    correlationId?: string;
    metadata?: Readonly<Record<string, unknown>>;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.payload = props.payload;
    this.status = props.status;
    this.priority = props.priority;
    this.queue = props.queue;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.attempts = props.attempts;
    this.maxAttempts = props.maxAttempts;
    this.scheduledAt = props.scheduledAt;
    this.correlationId = props.correlationId;
    this.metadata = props.metadata;
    Object.freeze(this);
  }

  static create(props: JobProps): Job {
    const name = props.name?.trim();
    if (!name) {
      throw new Error("Job requires a non-empty name.");
    }

    const now = new Date().toISOString();
    return new Job({
      id: props.id ?? JobId.generate(),
      name,
      payload: props.payload,
      status: props.status ?? "pending",
      priority: props.priority ?? parseJobPriority("normal"),
      queue: props.queue?.trim() || "default",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      attempts: props.attempts ?? 0,
      maxAttempts: props.maxAttempts ?? 3,
      scheduledAt: props.scheduledAt,
      correlationId: props.correlationId?.trim() || undefined,
      metadata: props.metadata ? Object.freeze({ ...props.metadata }) : undefined,
    });
  }

  withStatus(status: JobStatus): Job {
    return Job.create({
      id: this.id,
      name: this.name,
      payload: this.payload,
      status,
      priority: this.priority,
      queue: this.queue,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      scheduledAt: this.scheduledAt,
      correlationId: this.correlationId,
      metadata: this.metadata,
    });
  }

  withAttemptIncrement(): Job {
    return Job.create({
      id: this.id,
      name: this.name,
      payload: this.payload,
      status: this.status,
      priority: this.priority,
      queue: this.queue,
      createdAt: this.createdAt,
      updatedAt: new Date().toISOString(),
      attempts: this.attempts + 1,
      maxAttempts: this.maxAttempts,
      scheduledAt: this.scheduledAt,
      correlationId: this.correlationId,
      metadata: this.metadata,
    });
  }
}
