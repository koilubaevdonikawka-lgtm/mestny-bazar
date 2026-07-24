import type { ICapabilityRepository } from "@server/application/ai-capability-registry/contracts/capability-repository.contract";
import type { Capability } from "@server/application/ai-capability-registry/models/capability.model";

/** In-memory capability store. */
export class CapabilityRepository implements ICapabilityRepository {
  private readonly capabilities = new Map<string, Capability>();
  private readonly capabilitiesByName = new Map<string, string>();
  private readonly capabilitiesByCategory = new Map<string, Set<string>>();

  async save(capability: Capability): Promise<void> {
    const existing = this.capabilities.get(capability.capabilityId);
    if (existing) {
      if (existing.name !== capability.name) {
        this.capabilitiesByName.delete(existing.name);
      }
      if (existing.category !== capability.category) {
        this.removeFromCategory(existing.category, existing.capabilityId);
      }
    }

    this.capabilities.set(capability.capabilityId, capability);
    this.capabilitiesByName.set(capability.name, capability.capabilityId);
    this.addToCategory(capability.category, capability.capabilityId);
  }

  async findById(capabilityId: string): Promise<Capability | null> {
    return this.capabilities.get(capabilityId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Capability | null> {
    const capabilityId = this.capabilitiesByName.get(name.trim());
    if (!capabilityId) {
      return null;
    }
    return this.capabilities.get(capabilityId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Capability[]> {
    const capabilityIds = this.capabilitiesByCategory.get(category.trim());
    if (!capabilityIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...capabilityIds]
        .map((capabilityId) => this.capabilities.get(capabilityId))
        .filter((capability): capability is Capability => capability !== undefined),
    );
  }

  async findAll(): Promise<readonly Capability[]> {
    return Object.freeze([...this.capabilities.values()]);
  }

  async delete(capabilityId: string): Promise<boolean> {
    const capability = await this.findById(capabilityId);
    if (!capability) {
      return false;
    }
    this.capabilities.delete(capability.capabilityId);
    this.capabilitiesByName.delete(capability.name);
    this.removeFromCategory(capability.category, capability.capabilityId);
    return true;
  }

  private addToCategory(category: string, capabilityId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.capabilitiesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(capabilityId);
    this.capabilitiesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, capabilityId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.capabilitiesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(capabilityId);
    if (categorySet.size === 0) {
      this.capabilitiesByCategory.delete(normalizedCategory);
    }
  }
}
