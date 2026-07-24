import type { PolicySet } from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** Future integration point for policy set synchronization. Not wired yet. */
export interface IPolicySetSynchronizationProvider {
  synchronize(policySets: readonly PolicySet[]): Promise<void>;
}
