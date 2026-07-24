import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

/** Future integration point for capability export. Not wired yet. */
export interface ICapabilityExportProvider {
  exportCapability(capability: Capability): Promise<string>;
  exportAll(capabilities: readonly Capability[]): Promise<string>;
}
