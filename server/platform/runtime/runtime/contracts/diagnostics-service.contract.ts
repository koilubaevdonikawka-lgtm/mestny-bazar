import type { DiagnosticsReport } from "@server/platform/runtime/runtime/models";

/** Platform diagnostics service contract. */
export interface IDiagnosticsService {
  collect(): Promise<DiagnosticsReport>;
}
