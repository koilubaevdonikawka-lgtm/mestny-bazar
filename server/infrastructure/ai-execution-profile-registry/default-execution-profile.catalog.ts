import type { IExecutionProfileCatalog } from "@server/application/ai-execution-profile-registry/contracts/execution-profile-catalog.contract";
import type { ExecutionProfile } from "@server/application/ai-execution-profile-registry/models/execution-profile.model";

/** Default in-memory execution profile catalog index. */
export class DefaultExecutionProfileCatalog implements IExecutionProfileCatalog {
  private readonly executionProfiles = new Map<string, ExecutionProfile>();
  private readonly executionProfilesByName = new Map<string, string>();
  private readonly executionProfilesByCategory = new Map<string, Set<string>>();

  async register(executionProfile: ExecutionProfile): Promise<void> {
    const existing = this.executionProfiles.get(executionProfile.executionProfileId);
    if (existing) {
      if (existing.name !== executionProfile.name) {
        this.executionProfilesByName.delete(existing.name);
      }
      if (existing.category !== executionProfile.category) {
        this.removeFromCategory(existing.category, existing.executionProfileId);
      }
    }

    this.executionProfiles.set(executionProfile.executionProfileId, executionProfile);
    this.executionProfilesByName.set(executionProfile.name, executionProfile.executionProfileId);
    this.addToCategory(executionProfile.category, executionProfile.executionProfileId);
  }

  async remove(executionProfileId: string): Promise<void> {
    const executionProfile = this.executionProfiles.get(executionProfileId.trim());
    if (!executionProfile) {
      return;
    }
    this.executionProfiles.delete(executionProfile.executionProfileId);
    this.executionProfilesByName.delete(executionProfile.name);
    this.removeFromCategory(executionProfile.category, executionProfile.executionProfileId);
  }

  async findById(executionProfileId: string): Promise<ExecutionProfile | null> {
    return this.executionProfiles.get(executionProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ExecutionProfile | null> {
    const executionProfileId = this.executionProfilesByName.get(name.trim());
    if (!executionProfileId) {
      return null;
    }
    return this.executionProfiles.get(executionProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ExecutionProfile[]> {
    const executionProfileIds = this.executionProfilesByCategory.get(category.trim());
    if (!executionProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...executionProfileIds]
        .map((executionProfileId) => this.executionProfiles.get(executionProfileId))
        .filter((executionProfile): executionProfile is ExecutionProfile => executionProfile !== undefined),
    );
  }

  async listAll(): Promise<readonly ExecutionProfile[]> {
    return Object.freeze([...this.executionProfiles.values()]);
  }

  private addToCategory(category: string, executionProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.executionProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(executionProfileId);
    this.executionProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, executionProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.executionProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(executionProfileId);
    if (categorySet.size === 0) {
      this.executionProfilesByCategory.delete(normalizedCategory);
    }
  }
}
