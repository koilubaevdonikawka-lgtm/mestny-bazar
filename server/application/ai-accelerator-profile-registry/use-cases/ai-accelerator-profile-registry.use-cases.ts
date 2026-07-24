import type {
  DeleteAcceleratorProfileResult,
  FindAcceleratorProfileByNameResult,
  AcceleratorProfile,
  AcceleratorProfileRegistryStatistics,
  ListAcceleratorProfilesByCategoryResult,
  ListAcceleratorProfilesResult,
  RegisterAcceleratorProfileInput,
  UpdateAcceleratorProfileInput,
} from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";
import type { AiAcceleratorProfileRegistryService } from "@server/application/ai-accelerator-profile-registry/services/ai-accelerator-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterAcceleratorProfileUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(input: RegisterAcceleratorProfileInput): Promise<UseCaseResult<AcceleratorProfile>> {
    return this.acceleratorProfileRegistry.registerAcceleratorProfile(input).then(useCaseResult);
  }
}

export class GetAcceleratorProfileUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(acceleratorProfileId: string): Promise<UseCaseResult<AcceleratorProfile | null>> {
    return this.acceleratorProfileRegistry.getAcceleratorProfile(acceleratorProfileId).then(useCaseResult);
  }
}

export class ListAcceleratorProfilesUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListAcceleratorProfilesResult>> {
    return this.acceleratorProfileRegistry.listAcceleratorProfiles().then(useCaseResult);
  }
}

export class UpdateAcceleratorProfileUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(input: UpdateAcceleratorProfileInput): Promise<UseCaseResult<AcceleratorProfile>> {
    return this.acceleratorProfileRegistry.updateAcceleratorProfile(input).then(useCaseResult);
  }
}

export class DeleteAcceleratorProfileUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(acceleratorProfileId: string): Promise<UseCaseResult<DeleteAcceleratorProfileResult>> {
    return this.acceleratorProfileRegistry.deleteAcceleratorProfile(acceleratorProfileId).then(useCaseResult);
  }
}

export class FindAcceleratorProfileByNameUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindAcceleratorProfileByNameResult>> {
    return this.acceleratorProfileRegistry.findAcceleratorProfileByName(name).then(useCaseResult);
  }
}

export class ListAcceleratorProfilesByCategoryUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListAcceleratorProfilesByCategoryResult>> {
    return this.acceleratorProfileRegistry.listAcceleratorProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetAcceleratorProfileRegistryStatisticsUseCase {
  constructor(private readonly acceleratorProfileRegistry: AiAcceleratorProfileRegistryService) {}

  execute(): Promise<UseCaseResult<AcceleratorProfileRegistryStatistics>> {
    return this.acceleratorProfileRegistry.getAcceleratorProfileRegistryStatistics().then(useCaseResult);
  }
}
