import type {
  DeleteCapabilityProfileResult,
  FindCapabilityProfileByNameResult,
  CapabilityProfile,
  CapabilityProfileRegistryStatistics,
  ListCapabilityProfilesByCategoryResult,
  ListCapabilityProfilesResult,
  RegisterCapabilityProfileInput,
  UpdateCapabilityProfileInput,
} from "@server/application/ai-capability-profile-registry/models/capability-profile.model";
import type { AiCapabilityProfileRegistryService } from "@server/application/ai-capability-profile-registry/services/ai-capability-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterCapabilityProfileUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(input: RegisterCapabilityProfileInput): Promise<UseCaseResult<CapabilityProfile>> {
    return this.capabilityProfileRegistry.registerCapabilityProfile(input).then(useCaseResult);
  }
}

export class GetCapabilityProfileUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(capabilityProfileId: string): Promise<UseCaseResult<CapabilityProfile | null>> {
    return this.capabilityProfileRegistry.getCapabilityProfile(capabilityProfileId).then(useCaseResult);
  }
}

export class ListCapabilityProfilesUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListCapabilityProfilesResult>> {
    return this.capabilityProfileRegistry.listCapabilityProfiles().then(useCaseResult);
  }
}

export class UpdateCapabilityProfileUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(input: UpdateCapabilityProfileInput): Promise<UseCaseResult<CapabilityProfile>> {
    return this.capabilityProfileRegistry.updateCapabilityProfile(input).then(useCaseResult);
  }
}

export class DeleteCapabilityProfileUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(capabilityProfileId: string): Promise<UseCaseResult<DeleteCapabilityProfileResult>> {
    return this.capabilityProfileRegistry.deleteCapabilityProfile(capabilityProfileId).then(useCaseResult);
  }
}

export class FindCapabilityProfileByNameUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindCapabilityProfileByNameResult>> {
    return this.capabilityProfileRegistry.findCapabilityProfileByName(name).then(useCaseResult);
  }
}

export class ListCapabilityProfilesByCategoryUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListCapabilityProfilesByCategoryResult>> {
    return this.capabilityProfileRegistry.listCapabilityProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetCapabilityProfileRegistryStatisticsUseCase {
  constructor(private readonly capabilityProfileRegistry: AiCapabilityProfileRegistryService) {}

  execute(): Promise<UseCaseResult<CapabilityProfileRegistryStatistics>> {
    return this.capabilityProfileRegistry.getCapabilityProfileRegistryStatistics().then(useCaseResult);
  }
}
