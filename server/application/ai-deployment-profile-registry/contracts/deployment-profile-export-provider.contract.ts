import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Future integration point for deployment profile export. Not wired yet. */
export interface IDeploymentProfileExportProvider {
  exportDeploymentProfiles(deploymentProfiles: readonly DeploymentProfile[]): Promise<string>;
}
