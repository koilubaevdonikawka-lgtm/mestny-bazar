import type { Policy } from "@server/application/ai-policy-registry/models/policy.model";

/** Future integration point for policy synchronization. Not wired yet. */
export interface IPolicySynchronizationProvider {
  synchronize(policies: readonly Policy[]): Promise<void>;
}
