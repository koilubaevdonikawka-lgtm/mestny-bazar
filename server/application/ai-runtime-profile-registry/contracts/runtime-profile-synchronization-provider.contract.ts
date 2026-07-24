import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** Future integration point for runtime profile synchronization. Not wired yet. */
export interface IRuntimeProfileSynchronizationProvider {
  synchronize(runtimeProfiles: readonly RuntimeProfile[]): Promise<void>;
}
