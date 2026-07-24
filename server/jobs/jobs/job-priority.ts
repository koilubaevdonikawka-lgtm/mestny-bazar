/** Priority level for job scheduling and dequeue ordering. */
export type JobPriority = "low" | "normal" | "high" | "critical";

export const JobPriorityWeight: Readonly<Record<JobPriority, number>> = Object.freeze({
  low: 1,
  normal: 2,
  high: 3,
  critical: 4,
});

/** Normalizes arbitrary input into a supported job priority. */
export function parseJobPriority(raw: string): JobPriority {
  const normalized = raw?.trim().toLowerCase();
  if (normalized && normalized in JobPriorityWeight) {
    return normalized as JobPriority;
  }
  return "normal";
}

/** Compares two priorities — higher weight dequeues first. */
export function compareJobPriority(a: JobPriority, b: JobPriority): number {
  return JobPriorityWeight[b] - JobPriorityWeight[a];
}
