import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Future integration point for deployment profile synchronization. Not wired yet. */
export interface IDeploymentProfileSynchronizationProvider {
  synchronize(deploymentProfiles: readonly DeploymentProfile[]): Promise<void>;
}
