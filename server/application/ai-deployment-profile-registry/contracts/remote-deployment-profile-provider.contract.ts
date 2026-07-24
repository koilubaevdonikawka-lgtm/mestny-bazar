import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Future integration point for external deployment profile providers. Not wired yet. */
export interface IRemoteDeploymentProfileProvider {
  fetchRemote(deploymentProfileId: string): Promise<DeploymentProfile | null>;
  pushRemote(deploymentProfile: DeploymentProfile): Promise<void>;
}
