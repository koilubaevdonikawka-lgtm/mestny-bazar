import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

export interface ICapabilityProfileCatalog {
  register(capabilityProfile: CapabilityProfile): Promise<void>;
  remove(capabilityProfileId: string): Promise<void>;
  findById(capabilityProfileId: string): Promise<CapabilityProfile | null>;
  findByName(name: string): Promise<CapabilityProfile | null>;
  findByCategory(category: string): Promise<readonly CapabilityProfile[]>;
  listAll(): Promise<readonly CapabilityProfile[]>;
}
