import type { LivenessStatus } from "@server/platform/runtime/runtime/models";

/** Platform liveness service contract. */
export interface ILivenessService {
  check(): LivenessStatus;
}
