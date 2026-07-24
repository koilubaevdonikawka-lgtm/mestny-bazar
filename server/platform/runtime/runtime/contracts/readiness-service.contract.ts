import type { ReadinessStatus } from "@server/platform/runtime/runtime/models";

/** Platform readiness service contract. */
export interface IReadinessService {
  check(): Promise<ReadinessStatus>;
}
