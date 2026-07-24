import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

export interface IDeploymentProfileCatalog {
  register(deploymentProfile: DeploymentProfile): Promise<void>;
  remove(deploymentProfileId: string): Promise<void>;
  findById(deploymentProfileId: string): Promise<DeploymentProfile | null>;
  findByName(name: string): Promise<DeploymentProfile | null>;
  findByCategory(category: string): Promise<readonly DeploymentProfile[]>;
  listAll(): Promise<readonly DeploymentProfile[]>;
}
