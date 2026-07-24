export type RuntimeHealthStatus = "healthy" | "degraded" | "unhealthy";

export interface RuntimeComponentHealth {
  readonly name: string;
  readonly status: RuntimeHealthStatus;
  readonly message?: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface RuntimeHealthReport {
  readonly status: RuntimeHealthStatus;
  readonly timestamp: string;
  readonly components: readonly RuntimeComponentHealth[];
}

export function createRuntimeComponentHealth(input: {
  name: string;
  status: RuntimeHealthStatus;
  message?: string;
  details?: Readonly<Record<string, unknown>>;
}): RuntimeComponentHealth {
  return Object.freeze({
    name: input.name.trim(),
    status: input.status,
    message: input.message?.trim() || undefined,
    details: input.details ? Object.freeze({ ...input.details }) : undefined,
  });
}

export function createRuntimeHealthReport(input: {
  components: readonly RuntimeComponentHealth[];
}): RuntimeHealthReport {
  const statuses = input.components.map((component) => component.status);
  const status: RuntimeHealthStatus = statuses.every((value) => value === "healthy")
    ? "healthy"
    : statuses.some((value) => value === "unhealthy")
      ? "unhealthy"
      : "degraded";

  return Object.freeze({
    status,
    timestamp: new Date().toISOString(),
    components: Object.freeze([...input.components]),
  });
}
