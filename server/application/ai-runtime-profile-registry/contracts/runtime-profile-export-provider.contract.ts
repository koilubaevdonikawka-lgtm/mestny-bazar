import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** Future integration point for runtime profile export. Not wired yet. */
export interface IRuntimeProfileExportProvider {
  exportTo(runtimeProfiles: readonly RuntimeProfile[]): Promise<string>;
}
