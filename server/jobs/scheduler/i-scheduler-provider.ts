import type { ScheduledJob } from "@server/jobs/scheduler/scheduled-job";

/** Scheduler persistence port — implementations live in infrastructure. */
export interface ISchedulerProvider {
  register(job: ScheduledJob): Promise<void>;
  unregister(jobId: string): Promise<void>;
  list(): Promise<readonly ScheduledJob[]>;
  get(jobId: string): Promise<ScheduledJob | undefined>;
}
