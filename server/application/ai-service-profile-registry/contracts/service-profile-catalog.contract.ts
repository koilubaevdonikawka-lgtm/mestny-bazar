import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

export interface IServiceProfileCatalog {
  register(serviceProfile: ServiceProfile): Promise<void>;
  remove(serviceProfileId: string): Promise<void>;
  findById(serviceProfileId: string): Promise<ServiceProfile | null>;
  findByName(name: string): Promise<ServiceProfile | null>;
  findByCategory(category: string): Promise<readonly ServiceProfile[]>;
  listAll(): Promise<readonly ServiceProfile[]>;
}
