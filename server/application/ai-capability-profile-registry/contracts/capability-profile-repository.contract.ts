import type { CapabilityProfile } from "@server/application/ai-capability-profile-registry/models/capability-profile.model";

export interface ICapabilityProfileRepository {
  save(capabilityProfile: CapabilityProfile): Promise<void>;
  findById(capabilityProfileId: string): Promise<CapabilityProfile | null>;
  findByName(name: string): Promise<CapabilityProfile | null>;
  findByCategory(category: string): Promise<readonly CapabilityProfile[]>;
  findAll(): Promise<readonly CapabilityProfile[]>;
  delete(capabilityProfileId: string): Promise<boolean>;
}
