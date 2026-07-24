import type {
  Capability,
  CapabilityRegistryStatistics,
  DeleteCapabilityResult,
  FindCapabilityByNameResult,
  ListCapabilitiesByCategoryResult,
  ListCapabilitiesResult,
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-registry/models/capability.model";
import type { AiCapabilityRegistryService } from "@server/application/ai-capability-registry/services/ai-capability-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterCapabilityUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(input: RegisterCapabilityInput): Promise<UseCaseResult<Capability>> {
    return this.capabilityRegistry.registerCapability(input).then(useCaseResult);
  }
}

export class GetCapabilityUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(capabilityId: string): Promise<UseCaseResult<Capability | null>> {
    return this.capabilityRegistry.getCapability(capabilityId).then(useCaseResult);
  }
}

export class ListCapabilitiesUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(): Promise<UseCaseResult<ListCapabilitiesResult>> {
    return this.capabilityRegistry.listCapabilities().then(useCaseResult);
  }
}

export class UpdateCapabilityUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(input: UpdateCapabilityInput): Promise<UseCaseResult<Capability>> {
    return this.capabilityRegistry.updateCapability(input).then(useCaseResult);
  }
}

export class DeleteCapabilityUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(capabilityId: string): Promise<UseCaseResult<DeleteCapabilityResult>> {
    return this.capabilityRegistry.deleteCapability(capabilityId).then(useCaseResult);
  }
}

export class FindCapabilityByNameUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindCapabilityByNameResult>> {
    return this.capabilityRegistry.findCapabilityByName(name).then(useCaseResult);
  }
}

export class ListCapabilitiesByCategoryUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListCapabilitiesByCategoryResult>> {
    return this.capabilityRegistry.listCapabilitiesByCategory(category).then(useCaseResult);
  }
}

export class GetCapabilityRegistryStatisticsUseCase {
  constructor(private readonly capabilityRegistry: AiCapabilityRegistryService) {}

  execute(): Promise<UseCaseResult<CapabilityRegistryStatistics>> {
    return this.capabilityRegistry.getCapabilityRegistryStatistics().then(useCaseResult);
  }
}
