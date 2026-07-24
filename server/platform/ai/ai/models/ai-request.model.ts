/** Incoming AI execution request from platform consumers. */
export interface AIRequest {
  readonly taskType: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly requestedBy?: string;
  readonly workerIds?: readonly string[];
}

export function createAIRequest(input: AIRequest): AIRequest {
  return Object.freeze({
    taskType: input.taskType.trim(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    requestedBy: input.requestedBy?.trim() || undefined,
    workerIds: input.workerIds ? Object.freeze([...input.workerIds]) : undefined,
  });
}
