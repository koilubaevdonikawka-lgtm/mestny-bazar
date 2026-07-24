import type { RuntimeProfile } from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";

export interface IRuntimeProfileRepository {
  save(runtimeProfile: RuntimeProfile): Promise<void>;
  findById(runtimeProfileId: string): Promise<RuntimeProfile | null>;
  findByName(name: string): Promise<RuntimeProfile | null>;
  findByCategory(category: string): Promise<readonly RuntimeProfile[]>;
  findAll(): Promise<readonly RuntimeProfile[]>;
  delete(runtimeProfileId: string): Promise<boolean>;
}
