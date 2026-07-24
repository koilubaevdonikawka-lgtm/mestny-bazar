import type { ICapabilityCatalog } from "@server/application/ai-capability-discovery/contracts/capability-catalog.contract";
import type { ICapabilityRepository } from "@server/application/ai-capability-discovery/contracts/capability-repository.contract";
import type { AiCapability } from "@server/application/ai-capability-discovery/models/capability.model";

/** Default in-memory capability catalog. */
export class DefaultCapabilityCatalog implements ICapabilityCatalog {
  constructor(private readonly capabilityRepository: ICapabilityRepository) {}

  async listAll(): Promise<readonly AiCapability[]> {
    return Object.freeze(
      [...(await this.capabilityRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
  }

  async findByName(name: string): Promise<AiCapability | null> {
    return this.capabilityRepository.findByName(name.trim());
  }

  async listByCategory(category: string): Promise<readonly AiCapability[]> {
    return Object.freeze(
      [...(await this.capabilityRepository.findByCategory(category.trim()))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
  }
}
