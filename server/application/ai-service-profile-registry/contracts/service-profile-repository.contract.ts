import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

export interface IServiceProfileRepository {
  save(serviceProfile: ServiceProfile): Promise<void>;
  findById(serviceProfileId: string): Promise<ServiceProfile | null>;
  findByName(name: string): Promise<ServiceProfile | null>;
  findByCategory(category: string): Promise<readonly ServiceProfile[]>;
  findAll(): Promise<readonly ServiceProfile[]>;
  delete(serviceProfileId: string): Promise<boolean>;
}
