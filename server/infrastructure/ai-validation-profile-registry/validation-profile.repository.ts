import type { IValidationProfileRepository } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-repository.contract";
import type { ValidationProfile } from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** In-memory validation profile store. */
export class ValidationProfileRepository implements IValidationProfileRepository {
  private readonly validationProfiles = new Map<string, ValidationProfile>();
  private readonly validationProfilesByName = new Map<string, string>();
  private readonly validationProfilesByCategory = new Map<string, Set<string>>();

  async save(validationProfile: ValidationProfile): Promise<void> {
    const existing = this.validationProfiles.get(validationProfile.validationProfileId);
    if (existing) {
      if (existing.name !== validationProfile.name) {
        this.validationProfilesByName.delete(existing.name);
      }
      if (existing.category !== validationProfile.category) {
        this.removeFromCategory(existing.category, existing.validationProfileId);
      }
    }

    this.validationProfiles.set(validationProfile.validationProfileId, validationProfile);
    this.validationProfilesByName.set(validationProfile.name, validationProfile.validationProfileId);
    this.addToCategory(validationProfile.category, validationProfile.validationProfileId);
  }

  async findById(validationProfileId: string): Promise<ValidationProfile | null> {
    return this.validationProfiles.get(validationProfileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ValidationProfile | null> {
    const validationProfileId = this.validationProfilesByName.get(name.trim());
    if (!validationProfileId) {
      return null;
    }
    return this.validationProfiles.get(validationProfileId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ValidationProfile[]> {
    const validationProfileIds = this.validationProfilesByCategory.get(category.trim());
    if (!validationProfileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...validationProfileIds]
        .map((validationProfileId) => this.validationProfiles.get(validationProfileId))
        .filter((validationProfile): validationProfile is ValidationProfile => validationProfile !== undefined),
    );
  }

  async findAll(): Promise<readonly ValidationProfile[]> {
    return Object.freeze([...this.validationProfiles.values()]);
  }

  async delete(validationProfileId: string): Promise<boolean> {
    const validationProfile = await this.findById(validationProfileId);
    if (!validationProfile) {
      return false;
    }
    this.validationProfiles.delete(validationProfile.validationProfileId);
    this.validationProfilesByName.delete(validationProfile.name);
    this.removeFromCategory(validationProfile.category, validationProfile.validationProfileId);
    return true;
  }

  private addToCategory(category: string, validationProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.validationProfilesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(validationProfileId);
    this.validationProfilesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, validationProfileId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.validationProfilesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(validationProfileId);
    if (categorySet.size === 0) {
      this.validationProfilesByCategory.delete(normalizedCategory);
    }
  }
}
