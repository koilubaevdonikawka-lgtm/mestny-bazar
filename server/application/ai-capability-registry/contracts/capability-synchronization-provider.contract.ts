import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

/** Future integration point for capability synchronization. Not wired yet. */
export interface ICapabilitySynchronizationProvider {
  synchronize(capability: Capability): Promise<{ synchronized: boolean }>;
}
