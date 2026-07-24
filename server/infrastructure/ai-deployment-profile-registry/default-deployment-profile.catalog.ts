import type { IDeploymentProfileCatalog } from "@server/application/ai-deployment-profile-registry/contracts/deployment-profile-catalog.contract";
import type { DeploymentProfile } from "@server/application/ai-deployment-profile-registry/models/deployment-profile.model";

/** Default in-memory deployment profile catalog index. */
export class DefaultDeploymentProfileCatalog implements IDeploymentProfileCatalog {
  private readonly deploymentProfiles = new Map<string, DeploymentProfile>();
  private readonly deploymentProfilesByName = new Map<string, string>();
  private readonly deploymentProfilesByCategory = new Map<string, Set<string>>();

  async register(deploymentProfile: DeploymentProfile): Promise<void> {
    const existing = this.deploymentProfiles.get(deploymentProfile.deploymentProfileId);
    if (existing) {
      if (existing.name !== deploymentProfile.name) {
        this.deploymentProfilesByName.delete(existing.name);
      }
      if (existing.category !== deploymentProfile.category) {
        this.removeFromCategory(existing.category, existing.deploymentProfileId);
      }
    }

    this.deploymentProfiles.set(deploymentProfile.deploymentProfileId, deploymentProfile);
    this.deploymentProfilesByName.set(deploymentProfile.name, deploymentProfile.deploymentProfileId);
    this.addToCategory(deploymentProfile.category, deploymentProfile.deploymentProfileId);
  }

  async remove(deploymentProfileId: string): Promise<void> {
    const deploymentProfile = this.deploymentProfiles.get(deploymentProfileId.trim());
    if (!deploymentProfile) {
      return;
    }
    this.deploymentProfiles.delete(deploymentProfile.deploymentProfileId);
    this.deploymentProfilesByName.delete(deploymentProfile.name);
    this.removeFromCategory(deploymentProfile.category, deploymentProfile.deploymentProfileId);
  }

  async findById(deploymentProfileId: string): Promise<DeploymentProfile | null> {
    return this.deploymentProfiles.get(deploymentProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<DeploymentProfile | null> {
    const deploymentProfileId = this.deploymentProfilesByName.get(name.trim());
    if (!deploymentProfileId) {
      return null;
    }
    return this.deploymentProfiles.get(deploymentProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly DeploymentProfile[]> {
    const deploymentProfileIds = this.deploymentProfilesByCategory.get(category.trim());
    if (!deploymentProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...deploymentProfileIds]
        .map((deploymentProfileId) => this.deploymentProfiles.get(deploymentProfileId))
        .filter(
          (deploymentProfile): deploymentProfile is DeploymentProfile =>
            deploymentProfile !== undefined,
        ),
    );
  }

  async listAll(): Promise<readonly DeploymentProfile[]> {
    return Object.freeze([...this.deploymentProfiles.values()]);
  }

  private addToCategory(category: string, deploymentProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.deploymentProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(deploymentProfileId);
    this.deploymentProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, deploymentProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.deploymentProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(deploymentProfileId);
    if (categorySet.size === 0) {
      this.deploymentProfilesByCategory.delete(normalizedCategory);
    }
  }
}
