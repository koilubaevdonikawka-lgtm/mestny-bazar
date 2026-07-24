import type { ServiceProfile } from "@server/application/ai-service-profile-registry/models/service-profile.model";

export interface IServiceProfileSerializer {
  serialize(serviceProfile: ServiceProfile): Promise<string>;
  deserialize(serialized: string): Promise<ServiceProfile>;
}
