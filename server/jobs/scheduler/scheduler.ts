import { Job } from "@server/jobs/jobs/job";
import type { ScheduledJob } from "@server/jobs/scheduler/scheduled-job";

/** In-process scheduler that evaluates cron expressions without external libraries. */
export class Scheduler {
  private readonly jobs = new Map<string, ScheduledJob>();

  register(job: ScheduledJob): Scheduler {
    if (this.jobs.has(job.id)) {
      throw new Error(`Scheduled job already registered: ${job.id}`);
    }
    this.jobs.set(job.id, job);
    return this;
  }

  unregister(id: string): Scheduler {
    this.jobs.delete(id);
    return this;
  }

  get(id: string): ScheduledJob | undefined {
    return this.jobs.get(id);
  }

  list(): readonly ScheduledJob[] {
    return Object.freeze([...this.jobs.values()]);
  }

  /** Returns scheduled jobs that are due at the given instant. */
  dueAt(instant: Date = new Date()): readonly ScheduledJob[] {
    return Object.freeze(
      [...this.jobs.values()].filter((job) => job.enabled && job.cron.matches(instant)),
    );
  }

  /** Materializes due scheduled jobs into executable Job instances. */
  materializeDue(instant: Date = new Date(), correlationId?: string): readonly Job[] {
    return Object.freeze(
      this.dueAt(instant).map((scheduled) =>
        Job.create({
          name: scheduled.name,
          payload: scheduled.payload,
          queue: scheduled.queue,
          priority: scheduled.priority,
          scheduledAt: instant.toISOString(),
          correlationId,
          metadata: Object.freeze({ scheduledJobId: scheduled.id }),
        }),
      ),
    );
  }
}
