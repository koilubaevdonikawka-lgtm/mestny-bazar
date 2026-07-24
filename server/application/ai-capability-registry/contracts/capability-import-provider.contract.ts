import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

/** Future integration point for capability import. Not wired yet. */
export interface ICapabilityImportProvider {
  importFromSource(source: string): Promise<readonly Capability[]>;
}
