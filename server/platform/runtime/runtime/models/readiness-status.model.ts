export interface ReadinessStatus {
  readonly ready: boolean;
  readonly timestamp: string;
  readonly message?: string;
  readonly blockers: readonly string[];
}

export function createReadinessStatus(input: {
  ready: boolean;
  message?: string;
  blockers?: readonly string[];
}): ReadinessStatus {
  return Object.freeze({
    ready: input.ready,
    timestamp: new Date().toISOString(),
    message: input.message?.trim() || undefined,
    blockers: Object.freeze([...(input.blockers ?? [])]),
  });
}
