import type {
  DeleteValidationProfileResult,
  FindValidationProfileByNameResult,
  ListValidationProfilesByCategoryResult,
  ListValidationProfilesResult,
  RegisterValidationProfileInput,
  ValidationProfile,
  ValidationProfileRegistryStatistics,
  UpdateValidationProfileInput,
} from "@server/application/ai-validation-profile-registry/models/validation-profile.model";
import type { AiValidationProfileRegistryService } from "@server/application/ai-validation-profile-registry/services/ai-validation-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterValidationProfileUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(input: RegisterValidationProfileInput): Promise<UseCaseResult<ValidationProfile>> {
    return this.validationProfileRegistry.registerValidationProfile(input).then(useCaseResult);
  }
}

export class GetValidationProfileUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(validationProfileId: string): Promise<UseCaseResult<ValidationProfile | null>> {
    return this.validationProfileRegistry.getValidationProfile(validationProfileId).then(useCaseResult);
  }
}

export class ListValidationProfilesUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListValidationProfilesResult>> {
    return this.validationProfileRegistry.listValidationProfiles().then(useCaseResult);
  }
}

export class UpdateValidationProfileUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(input: UpdateValidationProfileInput): Promise<UseCaseResult<ValidationProfile>> {
    return this.validationProfileRegistry.updateValidationProfile(input).then(useCaseResult);
  }
}

export class DeleteValidationProfileUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(validationProfileId: string): Promise<UseCaseResult<DeleteValidationProfileResult>> {
    return this.validationProfileRegistry.deleteValidationProfile(validationProfileId).then(useCaseResult);
  }
}

export class FindValidationProfileByNameUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindValidationProfileByNameResult>> {
    return this.validationProfileRegistry.findValidationProfileByName(name).then(useCaseResult);
  }
}

export class ListValidationProfilesByCategoryUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListValidationProfilesByCategoryResult>> {
    return this.validationProfileRegistry.listValidationProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetValidationProfileRegistryStatisticsUseCase {
  constructor(private readonly validationProfileRegistry: AiValidationProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ValidationProfileRegistryStatistics>> {
    return this.validationProfileRegistry.getValidationProfileRegistryStatistics().then(useCaseResult);
  }
}
