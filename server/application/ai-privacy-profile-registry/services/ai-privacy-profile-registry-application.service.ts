import type {
  RegisterPrivacyProfileInput,
  UpdatePrivacyProfileInput,
} from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";
import {
  DeletePrivacyProfileUseCase,
  FindPrivacyProfileByNameUseCase,
  GetPrivacyProfileRegistryStatisticsUseCase,
  GetPrivacyProfileUseCase,
  ListPrivacyProfilesByCategoryUseCase,
  ListPrivacyProfilesUseCase,
  RegisterPrivacyProfileUseCase,
  UpdatePrivacyProfileUseCase,
} from "@server/application/ai-privacy-profile-registry/use-cases/ai-privacy-profile-registry.use-cases";

/** Application facade for AI Privacy Profile Registry scenario. */
export class AiPrivacyProfileRegistryApplicationService {
  constructor(
    private readonly registerPrivacyProfileUseCase: RegisterPrivacyProfileUseCase,
    private readonly getPrivacyProfileUseCase: GetPrivacyProfileUseCase,
    private readonly listPrivacyProfilesUseCase: ListPrivacyProfilesUseCase,
    private readonly updatePrivacyProfileUseCase: UpdatePrivacyProfileUseCase,
    private readonly deletePrivacyProfileUseCase: DeletePrivacyProfileUseCase,
    private readonly findPrivacyProfileByNameUseCase: FindPrivacyProfileByNameUseCase,
    private readonly listPrivacyProfilesByCategoryUseCase: ListPrivacyProfilesByCategoryUseCase,
    private readonly getPrivacyProfileRegistryStatisticsUseCase: GetPrivacyProfileRegistryStatisticsUseCase,
  ) {}

  registerPrivacyProfile(input: RegisterPrivacyProfileInput) {
    return this.registerPrivacyProfileUseCase.execute(input);
  }

  getPrivacyProfile(privacyProfileId: string) {
    return this.getPrivacyProfileUseCase.execute(privacyProfileId);
  }

  listPrivacyProfiles() {
    return this.listPrivacyProfilesUseCase.execute();
  }

  updatePrivacyProfile(input: UpdatePrivacyProfileInput) {
    return this.updatePrivacyProfileUseCase.execute(input);
  }

  deletePrivacyProfile(privacyProfileId: string) {
    return this.deletePrivacyProfileUseCase.execute(privacyProfileId);
  }

  findPrivacyProfileByName(name: string) {
    return this.findPrivacyProfileByNameUseCase.execute(name);
  }

  listPrivacyProfilesByCategory(category: string) {
    return this.listPrivacyProfilesByCategoryUseCase.execute(category);
  }

  getPrivacyProfileRegistryStatistics() {
    return this.getPrivacyProfileRegistryStatisticsUseCase.execute();
  }
}
