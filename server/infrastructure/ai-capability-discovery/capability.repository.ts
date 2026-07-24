import type { ICapabilityRepository } from "@server/application/ai-capability-discovery/contracts/capability-repository.contract";
import type { AiCapability } from "@server/application/ai-capability-discovery/models/capability.model";

/** In-memory AI capability store. */
export class CapabilityRepository implements ICapabilityRepository {
  private readonly capabilities = new Map<string, AiCapability>();
  private readonly capabilitiesByName = new Map<string, string>();

  async save(capability: AiCapability): Promise<void> {
    const existing = this.capabilities.get(capability.capabilityId);
    if (existing && existing.name !== capability.name) {
      this.capabilitiesByName.delete(existing.name);
    }

    this.capabilities.set(capability.capabilityId, capability);
    this.capabilitiesByName.set(capability.name, capability.capabilityId);
  }

  async findById(capabilityId: string): Promise<AiCapability | null> {
    return this.capabilities.get(capabilityId.trim()) ?? null;
  }

  async findByName(name: string): Promise<AiCapability | null> {
    const capabilityId = this.capabilitiesByName.get(name.trim());
    if (!capabilityId) {
      return null;
    }
    return this.findById(capabilityId);
  }

  async findByCategory(category: string): Promise<readonly AiCapability[]> {
    const normalizedCategory = category.trim();
    return Object.freeze(
      [...this.capabilities.values()].filter(
        (capability) => capability.category === normalizedCategory,
      ),
    );
  }

  async findAll(): Promise<readonly AiCapability[]> {
    return Object.freeze([...this.capabilities.values()]);
  }

  async delete(capabilityId: string): Promise<boolean> {
    const capability = await this.findById(capabilityId);
    if (!capability) {
      return false;
    }
    this.capabilities.delete(capability.capabilityId);
    this.capabilitiesByName.delete(capability.name);
    return true;
  }
}
