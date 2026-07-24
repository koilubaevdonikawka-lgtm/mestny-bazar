import type { IAuditProfileCatalog } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-catalog.contract";
import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

/** Default in-memory audit profile catalog index. */
export class DefaultAuditProfileCatalog implements IAuditProfileCatalog {
  private readonly auditProfiles = new Map<string, AuditProfile>();
  private readonly auditProfilesByName = new Map<string, string>();
  private readonly auditProfilesByCategory = new Map<string, Set<string>>();

  async register(auditProfile: AuditProfile): Promise<void> {
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

  async remove(auditProfileId: string): Promise<void> {
    const auditProfile = this.auditProfiles.get(auditProfileId.trim());
    if (!auditProfile) {
      return;
    }
    this.auditProfiles.delete(auditProfile.auditProfileId);
    this.auditProfilesByName.delete(auditProfile.name);
    this.removeFromCategory(auditProfile.category, auditProfile.auditProfileId);
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

  async listAll(): Promise<readonly AuditProfile[]> {
    return Object.freeze([...this.auditProfiles.values()]);
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
