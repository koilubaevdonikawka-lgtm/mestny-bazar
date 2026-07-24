import type { RuntimeHealthReport } from "@server/platform/runtime/runtime/models";

/** Platform health service contract. */
export interface IHealthService {
  check(): Promise<RuntimeHealthReport>;
}
