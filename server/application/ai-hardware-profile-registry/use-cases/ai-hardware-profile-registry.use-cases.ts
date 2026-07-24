import type {
  DeleteHardwareProfileResult,
  FindHardwareProfileByNameResult,
  HardwareProfile,
  HardwareProfileRegistryStatistics,
  ListHardwareProfilesByCategoryResult,
  ListHardwareProfilesResult,
  RegisterHardwareProfileInput,
  UpdateHardwareProfileInput,
} from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";
import type { AiHardwareProfileRegistryService } from "@server/application/ai-hardware-profile-registry/services/ai-hardware-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterHardwareProfileUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(input: RegisterHardwareProfileInput): Promise<UseCaseResult<HardwareProfile>> {
    return this.hardwareProfileRegistry.registerHardwareProfile(input).then(useCaseResult);
  }
}

export class GetHardwareProfileUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(hardwareProfileId: string): Promise<UseCaseResult<HardwareProfile | null>> {
    return this.hardwareProfileRegistry.getHardwareProfile(hardwareProfileId).then(useCaseResult);
  }
}

export class ListHardwareProfilesUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListHardwareProfilesResult>> {
    return this.hardwareProfileRegistry.listHardwareProfiles().then(useCaseResult);
  }
}

export class UpdateHardwareProfileUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(input: UpdateHardwareProfileInput): Promise<UseCaseResult<HardwareProfile>> {
    return this.hardwareProfileRegistry.updateHardwareProfile(input).then(useCaseResult);
  }
}

export class DeleteHardwareProfileUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(hardwareProfileId: string): Promise<UseCaseResult<DeleteHardwareProfileResult>> {
    return this.hardwareProfileRegistry.deleteHardwareProfile(hardwareProfileId).then(useCaseResult);
  }
}

export class FindHardwareProfileByNameUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindHardwareProfileByNameResult>> {
    return this.hardwareProfileRegistry.findHardwareProfileByName(name).then(useCaseResult);
  }
}

export class ListHardwareProfilesByCategoryUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListHardwareProfilesByCategoryResult>> {
    return this.hardwareProfileRegistry.listHardwareProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetHardwareProfileRegistryStatisticsUseCase {
  constructor(private readonly hardwareProfileRegistry: AiHardwareProfileRegistryService) {}

  execute(): Promise<UseCaseResult<HardwareProfileRegistryStatistics>> {
    return this.hardwareProfileRegistry.getHardwareProfileRegistryStatistics().then(useCaseResult);
  }
}
