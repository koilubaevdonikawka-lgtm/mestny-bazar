import type { IAuditProfileRepository } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-repository.contract";
import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** In-memory audit profile store. */
export class AuditProfileRepository implements IAuditProfileRepository {
  private readonly auditProfiles = new Map<string, AuditProfile>();
  private readonly auditProfilesByName = new Map<string, string>();
  private readonly auditProfilesByCategory = new Map<string, Set<string>>();

  async save(auditProfile: AuditProfile): Promise<void> {
    const existing = this.auditProfiles.get(auditProfile.auditProfileId);
    if (existing) {
      if (existing.name !== auditProfile.name) {
        this.auditProfilesByName.delete(existing.name);
      }
      if (existing.category !== auditProfile.category) {
        this.removeFromCategory(existing.category, existing.auditProfileId);
      }
    }

    this.auditProfiles.set(auditProfile.auditProfileId, auditProfile);
    this.auditProfilesByName.set(auditProfile.name, auditProfile.auditProfileId);
    this.addToCategory(auditProfile.category, auditProfile.auditProfileId);
  }

  async findById(auditProfileId: string): Promise<AuditProfile | null> {
    return this.auditProfiles.get(auditProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<AuditProfile | null> {
    const auditProfileId = this.auditProfilesByName.get(name.trim());
    if (!auditProfileId) {
      return null;
    }
    return this.auditProfiles.get(auditProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly AuditProfile[]> {
    const auditProfileIds = this.auditProfilesByCategory.get(category.trim());
    if (!auditProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...auditProfileIds]
        .map((auditProfileId) => this.auditProfiles.get(auditProfileId))
        .filter((auditProfile): auditProfile is AuditProfile => auditProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly AuditProfile[]> {
    return Object.freeze([...this.auditProfiles.values()]);
  }

  async delete(auditProfileId: string): Promise<boolean> {
    const auditProfile = await this.findById(auditProfileId);
    if (!auditProfile) {
      return false;
    }
    this.auditProfiles.delete(auditProfile.auditProfileId);
    this.auditProfilesByName.delete(auditProfile.name);
    this.removeFromCategory(auditProfile.category, auditProfile.auditProfileId);
    return true;
  }

  private addToCategory(category: string, auditProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.auditProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(auditProfileId);
    this.auditProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, auditProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.auditProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(auditProfileId);
    if (categorySet.size === 0) {
      this.auditProfilesByCategory.delete(normalizedCategory);
    }
  }
}
