import type {
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-discovery/models/capability.model";
import {
  DeleteCapabilityUseCase,
  FindCapabilityByNameUseCase,
  GetCapabilityStatisticsUseCase,
  GetCapabilityUseCase,
  ListCapabilitiesByCategoryUseCase,
  ListCapabilitiesUseCase,
  RegisterCapabilityUseCase,
  UpdateCapabilityUseCase,
} from "@server/application/ai-capability-discovery/use-cases/ai-capability-discovery.use-cases";

/** Application facade for AI Capability Discovery scenario. */
export class AiCapabilityDiscoveryApplicationService {
  constructor(
    private readonly registerCapabilityUseCase: RegisterCapabilityUseCase,
    private readonly getCapabilityUseCase: GetCapabilityUseCase,
    private readonly listCapabilitiesUseCase: ListCapabilitiesUseCase,
    private readonly updateCapabilityUseCase: UpdateCapabilityUseCase,
    private readonly deleteCapabilityUseCase: DeleteCapabilityUseCase,
    private readonly findCapabilityByNameUseCase: FindCapabilityByNameUseCase,
    private readonly listCapabilitiesByCategoryUseCase: ListCapabilitiesByCategoryUseCase,
    private readonly getCapabilityStatisticsUseCase: GetCapabilityStatisticsUseCase,
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

  getCapabilityStatistics() {
    return this.getCapabilityStatisticsUseCase.execute();
  }
}
