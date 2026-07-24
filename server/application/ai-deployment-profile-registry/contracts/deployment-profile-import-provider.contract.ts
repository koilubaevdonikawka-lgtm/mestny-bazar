import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Future integration point for deployment profile import. Not wired yet. */
export interface IDeploymentProfileImportProvider {
  importDeploymentProfiles(source: string): Promise<readonly DeploymentProfile[]>;
}
