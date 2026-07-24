import type { ReliabilityProfile } from "@server/application/ai-reliability-profile-registry/models/reliability-profile.model";

export interface IReliabilityProfileRepository {
  save(reliabilityProfile: ReliabilityProfile): Promise<void>;
  findById(reliabilityProfileId: string): Promise<ReliabilityProfile | null>;
  findByName(name: string): Promise<ReliabilityProfile | null>;
  findByCategory(category: string): Promise<readonly ReliabilityProfile[]>;
  findAll(): Promise<readonly ReliabilityProfile[]>;
  delete(reliabilityProfileId: string): Promise<boolean>;
}
