/** AI worker execution status. */
export const AIWorkerStatus = {
  Completed: "completed",
  Skipped: "skipped",
  Failed: "failed",
} as const;

export type AIWorkerStatusValue = (typeof AIWorkerStatus)[keyof typeof AIWorkerStatus];

/** Platform AI task executed by one or more workers. */
export interface AITask {
  readonly id: string;
  readonly type: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

export function createAITask(input: {
  id: string;
  type: string;
  payload?: Readonly<Record<string, unknown>>;
}): AITask {
  return Object.freeze({
    id: input.id.trim(),
    type: input.type.trim(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    createdAt: new Date().toISOString(),
  });
}
