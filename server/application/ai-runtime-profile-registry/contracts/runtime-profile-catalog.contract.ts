import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

export interface IRuntimeProfileCatalog {
  register(runtimeProfile: RuntimeProfile): Promise<void>;
  remove(runtimeProfileId: string): Promise<void>;
  findById(runtimeProfileId: string): Promise<RuntimeProfile | null>;
  findByName(name: string): Promise<RuntimeProfile | null>;
  findByCategory(category: string): Promise<readonly RuntimeProfile[]>;
  listAll(): Promise<readonly RuntimeProfile[]>;
}
