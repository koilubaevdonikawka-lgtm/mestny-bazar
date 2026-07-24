import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

export interface IDeploymentProfileSerializer {
  serialize(deploymentProfile: DeploymentProfile): Promise<string>;
  deserialize(serialized: string): Promise<DeploymentProfile>;
}
