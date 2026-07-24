import type { MaintenanceJob } from "@server/platform/operations/operations/models";

/** Contract for maintenance job schedule registration (no execution). */
export interface IMaintenanceScheduler {
  registerJob(job: MaintenanceJob): void;
  listJobs(): readonly MaintenanceJob[];
  getJob(jobId: string): MaintenanceJob | undefined;
}
