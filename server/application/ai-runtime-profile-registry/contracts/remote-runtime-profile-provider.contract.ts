import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** Future integration point for external runtime profile providers. Not wired yet. */
export interface IRemoteRuntimeProfileProvider {
  fetchRemote(runtimeProfileId: string): Promise<RuntimeProfile | null>;
  pushRemote(runtimeProfile: RuntimeProfile): Promise<void>;
}
