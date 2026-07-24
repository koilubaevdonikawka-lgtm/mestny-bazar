import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

export interface IDeploymentProfileRepository {
  save(deploymentProfile: DeploymentProfile): Promise<void>;
  findById(deploymentProfileId: string): Promise<DeploymentProfile | null>;
  findByName(name: string): Promise<DeploymentProfile | null>;
  findByCategory(category: string): Promise<readonly DeploymentProfile[]>;
  findAll(): Promise<readonly DeploymentProfile[]>;
  delete(deploymentProfileId: string): Promise<boolean>;
}
