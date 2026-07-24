import type {
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-registry/models/capability.model";
import {
  DeleteCapabilityUseCase,
  FindCapabilityByNameUseCase,
  GetCapabilityRegistryStatisticsUseCase,
  GetCapabilityUseCase,
  ListCapabilitiesByCategoryUseCase,
  ListCapabilitiesUseCase,
  RegisterCapabilityUseCase,
  UpdateCapabilityUseCase,
} from "@server/application/ai-capability-registry/use-cases/ai-capability-registry.use-cases";

/** Application facade for AI Capability Registry scenario. */
export class AiCapabilityRegistryApplicationService {
  constructor(
    private readonly registerCapabilityUseCase: RegisterCapabilityUseCase,
    private readonly getCapabilityUseCase: GetCapabilityUseCase,
    private readonly listCapabilitiesUseCase: ListCapabilitiesUseCase,
    private readonly updateCapabilityUseCase: UpdateCapabilityUseCase,
    private readonly deleteCapabilityUseCase: DeleteCapabilityUseCase,
    private readonly findCapabilityByNameUseCase: FindCapabilityByNameUseCase,
    private readonly listCapabilitiesByCategoryUseCase: ListCapabilitiesByCategoryUseCase,
    private readonly getCapabilityRegistryStatisticsUseCase: GetCapabilityRegistryStatisticsUseCase,
  ) {}

  registerCapability(input: RegisterCapabilityInput) {
    return this.registerCapabilityUseCase.execute(input);
  }

  getCapability(capabilityId: string) {
    return this.getCapabilityUseCase.execute(capabilityId);
  }

  listCapabilities() {
    return this.listCapabilitiesUseCase.execute();
  }

  updateCapability(input: UpdateCapabilityInput) {
    return this.updateCapabilityUseCase.execute(input);
  }

  deleteCapability(capabilityId: string) {
    return this.deleteCapabilityUseCase.execute(capabilityId);
  }

  findCapabilityByName(name: string) {
    return this.findCapabilityByNameUseCase.execute(name);
  }

  listCapabilitiesByCategory(category: string) {
    return this.listCapabilitiesByCategoryUseCase.execute(category);
  }

  getCapabilityRegistryStatistics() {
    return this.getCapabilityRegistryStatisticsUseCase.execute();
  }
}
