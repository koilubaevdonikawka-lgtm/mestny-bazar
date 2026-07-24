import type { IMaintenanceScheduler } from "@server/platform/operations/operations/contracts";
import { type MaintenanceJob } from "@server/platform/operations/operations/models";

/** Registers maintenance job schedules without executing them. */
export class MaintenanceScheduler implements IMaintenanceScheduler {
  private readonly jobs = new Map<string, MaintenanceJob>();

  registerJob(job: MaintenanceJob): void {
    if (this.jobs.has(job.id)) {
      throw new Error(`Maintenance job already registered: ${job.id}`);
    }
    this.jobs.set(job.id, Object.freeze({ ...job }));
  }

  listJobs(): readonly MaintenanceJob[] {
    return Object.freeze([...this.jobs.values()]);
  }

  getJob(jobId: string): MaintenanceJob | undefined {
    return this.jobs.get(jobId.trim());
  }
}
