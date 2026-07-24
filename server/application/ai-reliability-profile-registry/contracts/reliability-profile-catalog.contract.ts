import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

export interface IReliabilityProfileCatalog {
  register(reliabilityProfile: ReliabilityProfile): Promise<void>;
  remove(reliabilityProfileId: string): Promise<void>;
  findById(reliabilityProfileId: string): Promise<ReliabilityProfile | null>;
  findByName(name: string): Promise<ReliabilityProfile | null>;
  findByCategory(category: string): Promise<readonly ReliabilityProfile[]>;
  listAll(): Promise<readonly ReliabilityProfile[]>;
}
