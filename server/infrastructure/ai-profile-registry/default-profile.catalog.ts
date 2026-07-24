import type { IProfileCatalog } from "@server/application/ai-profile-registry/contracts/profile-catalog.contract";
import type { Profile } from "@server/application/ai-profile-registry/models/profile.model";

/** Default in-memory profile catalog index. */
export class DefaultProfileCatalog implements IProfileCatalog {
  private readonly profiles = new Map<string, Profile>();
  private readonly profilesByName = new Map<string, string>();
  private readonly profilesByType = new Map<string, Set<string>>();

  async register(profile: Profile): Promise<void> {
    const existing = this.profiles.get(profile.profileId);
    if (existing) {
      if (existing.name !== profile.name) {
        this.profilesByName.delete(existing.name);
      }
      if (existing.type !== profile.type) {
        this.removeFromType(existing.type, existing.profileId);
      }
    }

    this.profiles.set(profile.profileId, profile);
    this.profilesByName.set(profile.name, profile.profileId);
    this.addToType(profile.type, profile.profileId);
  }

  async remove(profileId: string): Promise<void> {
    const profile = this.profiles.get(profileId.trim());
    if (!profile) {
      return;
    }
    this.profiles.delete(profile.profileId);
    this.profilesByName.delete(profile.name);
    this.removeFromType(profile.type, profile.profileId);
  }

  async findById(profileId: string): Promise<Profile | null> {
    return this.profiles.get(profileId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Profile | null> {
    const profileId = this.profilesByName.get(name.trim());
    if (!profileId) {
      return null;
    }
    return this.profiles.get(profileId) ?? null;
  }

  async findByType(type: string): Promise<readonly Profile[]> {
    const profileIds = this.profilesByType.get(type.trim());
    if (!profileIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...profileIds]
        .map((profileId) => this.profiles.get(profileId))
        .filter((profile): profile is Profile => profile !== undefined),
    );
  }

  async listAll(): Promise<readonly Profile[]> {
    return Object.freeze([...this.profiles.values()]);
  }

  private addToType(type: string, profileId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.profilesByType.get(normalizedType) ?? new Set<string>();
    typeSet.add(profileId);
    this.profilesByType.set(normalizedType, typeSet);
  }

  private removeFromType(type: string, profileId: string): void {
    const normalizedType = type.trim();
    const typeSet = this.profilesByType.get(normalizedType);
    if (!typeSet) {
      return;
    }
    typeSet.delete(profileId);
    if (typeSet.size === 0) {
      this.profilesByType.delete(normalizedType);
    }
  }
}
