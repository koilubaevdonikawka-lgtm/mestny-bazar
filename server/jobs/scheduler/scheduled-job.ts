import type { CronExpression } from "@server/jobs/scheduler/cron-expression";
import { createJobPayload, type JobPayload } from "@server/jobs/jobs/job-payload";
import type { JobPriority } from "@server/jobs/jobs/job-priority";

/** Recurring or one-shot scheduled job definition. */
export interface ScheduledJob {
  readonly id: string;
  readonly name: string;
  readonly cron: CronExpression;
  readonly payload: JobPayload;
  readonly queue: string;
  readonly priority: JobPriority;
  readonly enabled: boolean;
  readonly timezone?: string;
  readonly nextRunAt?: string;
  readonly lastRunAt?: string;
}

export interface CreateScheduledJobInput {
  id: string;
  name: string;
  cron: CronExpression;
  payload: JobPayload;
  queue?: string;
  priority?: JobPriority;
  enabled?: boolean;
  timezone?: string;
  nextRunAt?: string;
  lastRunAt?: string;
}

/** Creates an immutable scheduled job definition. */
export function createScheduledJob(input: CreateScheduledJobInput): ScheduledJob {
  const id = input.id?.trim();
  const name = input.name?.trim();
  if (!id || !name) {
    throw new Error("ScheduledJob requires id and name.");
  }

  return Object.freeze({
    id,
    name,
    cron: input.cron,
    payload: input.payload,
    queue: input.queue?.trim() || "default",
    priority: input.priority ?? "normal",
    enabled: input.enabled ?? true,
    timezone: input.timezone?.trim() || "UTC",
    nextRunAt: input.nextRunAt,
    lastRunAt: input.lastRunAt,
  });
}

/** Helper to build a scheduled job from a cron string. */
export function scheduledJobFromCron(
  id: string,
  name: string,
  cronExpression: CronExpression,
  type: string,
  data: Readonly<Record<string, unknown>> = {},
): ScheduledJob {
  return createScheduledJob({
    id,
    name,
    cron: cronExpression,
    payload: createJobPayload(type, data),
  });
}
