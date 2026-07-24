/**
 * Future integration ports for Scheduling Management.
 * Not implemented — reserved for external scheduler systems.
 */

import type { ScheduledTask } from "@server/application/scheduling-management/models/scheduling.model";

/** Cron Engine — advanced cron scheduling. */
export interface ICronEngine {
  schedule(task: ScheduledTask): Promise<void>;
  unschedule(taskId: string): Promise<void>;
  trigger(taskId: string): Promise<void>;
}

/** Quartz Scheduler — Quartz.NET / Java Quartz integration. */
export interface IQuartzScheduler {
  registerJob(task: ScheduledTask): Promise<string>;
  deleteJob(jobId: string): Promise<void>;
  pauseJob(jobId: string): Promise<void>;
  resumeJob(jobId: string): Promise<void>;
}

/** Kubernetes Cron Provider — K8s CronJob integration. */
export interface IKubernetesCronProvider {
  createCronJob(task: ScheduledTask): Promise<string>;
  deleteCronJob(cronJobName: string): Promise<void>;
  suspendCronJob(cronJobName: string): Promise<void>;
  resumeCronJob(cronJobName: string): Promise<void>;
}

/** Background Worker Provider — hosted background worker integration. */
export interface IBackgroundWorkerProvider {
  enqueue(task: ScheduledTask): Promise<string>;
  cancel(workItemId: string): Promise<void>;
}

/** Distributed Scheduler — cluster-wide scheduling coordination. */
export interface IDistributedScheduler {
  claimTask(taskId: string, nodeId: string): Promise<boolean>;
  releaseTask(taskId: string, nodeId: string): Promise<void>;
  listActiveNodes(): Promise<readonly string[]>;
}
