import type { InspectionResult } from "@server/platform/developer/developer/models";

/** Contract for developer inspectors. */
export interface IInspector {
  readonly id: string;
  inspect(target?: string): Promise<InspectionResult> | InspectionResult;
}
