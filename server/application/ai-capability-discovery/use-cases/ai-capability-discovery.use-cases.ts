import type {
  AiCapability,
  CapabilityStatistics,
  DeleteCapabilityResult,
  FindCapabilityByNameResult,
  ListCapabilitiesByCategoryResult,
  ListCapabilitiesResult,
  RegisterCapabilityInput,
  UpdateCapabilityInput,
} from "@server/application/ai-capability-discovery/models/capability.model";
import type { AiCapabilityDiscoveryService } from "@server/application/ai-capability-discovery/services/ai-capability-discovery.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterCapabilityUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(input: RegisterCapabilityInput): Promise<UseCaseResult<AiCapability>> {
    return this.discovery.registerCapability(input).then(useCaseResult);
  }
}

export class GetCapabilityUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(capabilityId: string): Promise<UseCaseResult<AiCapability | null>> {
    return this.discovery.getCapability(capabilityId).then(useCaseResult);
  }
}

export class ListCapabilitiesUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(): Promise<UseCaseResult<ListCapabilitiesResult>> {
    return this.discovery.listCapabilities().then(useCaseResult);
  }
}

export class UpdateCapabilityUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(input: UpdateCapabilityInput): Promise<UseCaseResult<AiCapability>> {
    return this.discovery.updateCapability(input).then(useCaseResult);
  }
}

export class DeleteCapabilityUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(capabilityId: string): Promise<UseCaseResult<DeleteCapabilityResult>> {
    return this.discovery.deleteCapability(capabilityId).then(useCaseResult);
  }
}

export class FindCapabilityByNameUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(name: string): Promise<UseCaseResult<FindCapabilityByNameResult>> {
    return this.discovery.findCapabilityByName(name).then(useCaseResult);
  }
}

export class ListCapabilitiesByCategoryUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(category: string): Promise<UseCaseResult<ListCapabilitiesByCategoryResult>> {
    return this.discovery.listCapabilitiesByCategory(category).then(useCaseResult);
  }
}

export class GetCapabilityStatisticsUseCase {
  constructor(private readonly discovery: AiCapabilityDiscoveryService) {}

  execute(): Promise<UseCaseResult<CapabilityStatistics>> {
    return this.discovery.getCapabilityStatistics().then(useCaseResult);
  }
}
