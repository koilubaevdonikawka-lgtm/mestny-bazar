import type {
  DeleteTransparencyProfileResult,
  FindTransparencyProfileByNameResult,
  TransparencyProfile,
  TransparencyProfileRegistryStatistics,
  ListTransparencyProfilesByCategoryResult,
  ListTransparencyProfilesResult,
  RegisterTransparencyProfileInput,
  UpdateTransparencyProfileInput,
} from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";
import type { AiTransparencyProfileRegistryService } from "@server/application/ai-transparency-profile-registry/services/ai-transparency-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterTransparencyProfileUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(input: RegisterTransparencyProfileInput): Promise<UseCaseResult<TransparencyProfile>> {
    return this.transparencyProfileRegistry.registerTransparencyProfile(input).then(useCaseResult);
  }
}

export class GetTransparencyProfileUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(transparencyProfileId: string): Promise<UseCaseResult<TransparencyProfile | null>> {
    return this.transparencyProfileRegistry.getTransparencyProfile(transparencyProfileId).then(useCaseResult);
  }
}

export class ListTransparencyProfilesUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListTransparencyProfilesResult>> {
    return this.transparencyProfileRegistry.listTransparencyProfiles().then(useCaseResult);
  }
}

export class UpdateTransparencyProfileUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(input: UpdateTransparencyProfileInput): Promise<UseCaseResult<TransparencyProfile>> {
    return this.transparencyProfileRegistry.updateTransparencyProfile(input).then(useCaseResult);
  }
}

export class DeleteTransparencyProfileUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(transparencyProfileId: string): Promise<UseCaseResult<DeleteTransparencyProfileResult>> {
    return this.transparencyProfileRegistry.deleteTransparencyProfile(transparencyProfileId).then(useCaseResult);
  }
}

export class FindTransparencyProfileByNameUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindTransparencyProfileByNameResult>> {
    return this.transparencyProfileRegistry.findTransparencyProfileByName(name).then(useCaseResult);
  }
}

export class ListTransparencyProfilesByCategoryUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListTransparencyProfilesByCategoryResult>> {
    return this.transparencyProfileRegistry.listTransparencyProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetTransparencyProfileRegistryStatisticsUseCase {
  constructor(private readonly transparencyProfileRegistry: AiTransparencyProfileRegistryService) {}

  execute(): Promise<UseCaseResult<TransparencyProfileRegistryStatistics>> {
    return this.transparencyProfileRegistry.getTransparencyProfileRegistryStatistics().then(useCaseResult);
  }
}
