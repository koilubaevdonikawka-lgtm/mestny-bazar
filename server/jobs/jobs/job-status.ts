/** Lifecycle status of a background job. */
export type JobStatus =
  | "pending"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "retrying"
  | "dead_letter"
  | "cancelled";

export const JobStatusTransitions: Readonly<Record<JobStatus, readonly JobStatus[]>> = Object.freeze({
  pending: Object.freeze(["queued", "cancelled"]),
  queued: Object.freeze(["running", "cancelled"]),
  running: Object.freeze(["completed", "failed", "retrying"]),
  completed: Object.freeze([]),
  failed: Object.freeze(["retrying", "dead_letter"]),
  retrying: Object.freeze(["queued", "dead_letter"]),
  dead_letter: Object.freeze([]),
  cancelled: Object.freeze([]),
});

/** Returns true when a transition from `from` to `to` is allowed. */
export function canTransitionJobStatus(from: JobStatus, to: JobStatus): boolean {
  return JobStatusTransitions[from].includes(to);
}

/** Validates and applies a status transition or throws. */
export function transitionJobStatus(from: JobStatus, to: JobStatus): JobStatus {
  if (!canTransitionJobStatus(from, to)) {
    throw new Error(`Invalid job status transition: ${from} → ${to}`);
  }
  return to;
}
