/** Typed payload carried by background jobs. */
export interface JobPayload {
  readonly type: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly version?: string;
}

/** Creates an immutable job payload. */
export function createJobPayload(
  type: string,
  data: Readonly<Record<string, unknown>> = {},
  version?: string,
): JobPayload {
  const jobType = type?.trim();
  if (!jobType) {
    throw new Error("JobPayload requires a non-empty type.");
  }

  return Object.freeze({
    type: jobType,
    data: Object.freeze({ ...data }),
    version: version?.trim() || undefined,
  });
}
