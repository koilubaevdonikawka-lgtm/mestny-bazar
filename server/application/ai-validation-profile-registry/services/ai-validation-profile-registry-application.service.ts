import type {
  RegisterValidationProfileInput,
  UpdateValidationProfileInput,
} from "@server/application/ai-validation-profile-registry/models/validation-profile.model";
import {
  DeleteValidationProfileUseCase,
  FindValidationProfileByNameUseCase,
  GetValidationProfileRegistryStatisticsUseCase,
  GetValidationProfileUseCase,
  ListValidationProfilesByCategoryUseCase,
  ListValidationProfilesUseCase,
  RegisterValidationProfileUseCase,
  UpdateValidationProfileUseCase,
} from "@server/application/ai-validation-profile-registry/use-cases/ai-validation-profile-registry.use-cases";

/** Application facade for AI Validation Profile Registry scenario. */
export class AiValidationProfileRegistryApplicationService {
  constructor(
    private readonly registerValidationProfileUseCase: RegisterValidationProfileUseCase,
    private readonly getValidationProfileUseCase: GetValidationProfileUseCase,
    private readonly listValidationProfilesUseCase: ListValidationProfilesUseCase,
    private readonly updateValidationProfileUseCase: UpdateValidationProfileUseCase,
    private readonly deleteValidationProfileUseCase: DeleteValidationProfileUseCase,
    private readonly findValidationProfileByNameUseCase: FindValidationProfileByNameUseCase,
    private readonly listValidationProfilesByCategoryUseCase: ListValidationProfilesByCategoryUseCase,
    private readonly getValidationProfileRegistryStatisticsUseCase: GetValidationProfileRegistryStatisticsUseCase,
  ) {}

  registerValidationProfile(input: RegisterValidationProfileInput) {
    return this.registerValidationProfileUseCase.execute(input);
  }

  getValidationProfile(validationProfileId: string) {
    return this.getValidationProfileUseCase.execute(validationProfileId);
  }

  listValidationProfiles() {
    return this.listValidationProfilesUseCase.execute();
  }

  updateValidationProfile(input: UpdateValidationProfileInput) {
    return this.updateValidationProfileUseCase.execute(input);
  }

  deleteValidationProfile(validationProfileId: string) {
    return this.deleteValidationProfileUseCase.execute(validationProfileId);
  }

  findValidationProfileByName(name: string) {
    return this.findValidationProfileByNameUseCase.execute(name);
  }

  listValidationProfilesByCategory(category: string) {
    return this.listValidationProfilesByCategoryUseCase.execute(category);
  }

  getValidationProfileRegistryStatistics() {
    return this.getValidationProfileRegistryStatisticsUseCase.execute();
  }
}
