import type {
  RegisterProfileInput,
  UpdateProfileInput,
} from "@server/application/ai-profile-registry/models/profile.model";
import {
  DeleteProfileUseCase,
  FindProfileByNameUseCase,
  GetProfileRegistryStatisticsUseCase,
  GetProfileUseCase,
  ListProfilesByTypeUseCase,
  ListProfilesUseCase,
  RegisterProfileUseCase,
  UpdateProfileUseCase,
} from "@server/application/ai-profile-registry/use-cases/ai-profile-registry.use-cases";

/** Application facade for AI Profile Registry scenario. */
export class AiProfileRegistryApplicationService {
  constructor(
    private readonly registerProfileUseCase: RegisterProfileUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly listProfilesUseCase: ListProfilesUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase,
    private readonly findProfileByNameUseCase: FindProfileByNameUseCase,
    private readonly listProfilesByTypeUseCase: ListProfilesByTypeUseCase,
    private readonly getProfileRegistryStatisticsUseCase: GetProfileRegistryStatisticsUseCase,
  ) {}

  registerProfile(input: RegisterProfileInput) {
    return this.registerProfileUseCase.execute(input);
  }

  getProfile(profileId: string) {
    return this.getProfileUseCase.execute(profileId);
  }

  listProfiles() {
    return this.listProfilesUseCase.execute();
  }

  updateProfile(input: UpdateProfileInput) {
    return this.updateProfileUseCase.execute(input);
  }

  deleteProfile(profileId: string) {
    return this.deleteProfileUseCase.execute(profileId);
  }

  findProfileByName(name: string) {
    return this.findProfileByNameUseCase.execute(name);
  }

  listProfilesByType(type: string) {
    return this.listProfilesByTypeUseCase.execute(type);
  }

  getProfileRegistryStatistics() {
    return this.getProfileRegistryStatisticsUseCase.execute();
  }
}
