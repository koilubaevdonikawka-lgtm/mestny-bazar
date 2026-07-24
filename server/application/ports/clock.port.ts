/** Clock abstraction for deterministic time in use cases. */
export interface IClock {
  now(): Date;
  nowIso(): string;
}
