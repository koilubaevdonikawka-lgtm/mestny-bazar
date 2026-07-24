import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

/** Future integration point for runtime profile import. Not wired yet. */
export interface IRuntimeProfileImportProvider {
  importFrom(source: string): Promise<readonly RuntimeProfile[]>;
}
