import type {
  RegisterRuntimeProfileInput,
  UpdateRuntimeProfileInput,
} from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";
import {
  DeleteRuntimeProfileUseCase,
  FindRuntimeProfileByNameUseCase,
  GetRuntimeProfileRegistryStatisticsUseCase,
  GetRuntimeProfileUseCase,
  ListRuntimeProfilesByCategoryUseCase,
  ListRuntimeProfilesUseCase,
  RegisterRuntimeProfileUseCase,
  UpdateRuntimeProfileUseCase,
} from "@server/application/ai-runtime-profile-registry/use-cases/ai-runtime-profile-registry.use-cases";

/** Application facade for AI Runtime Profile Registry scenario. */
export class AiRuntimeProfileRegistryApplicationService {
  constructor(
    private readonly registerRuntimeProfileUseCase: RegisterRuntimeProfileUseCase,
    private readonly getRuntimeProfileUseCase: GetRuntimeProfileUseCase,
    private readonly listRuntimeProfilesUseCase: ListRuntimeProfilesUseCase,
    private readonly updateRuntimeProfileUseCase: UpdateRuntimeProfileUseCase,
    private readonly deleteRuntimeProfileUseCase: DeleteRuntimeProfileUseCase,
    private readonly findRuntimeProfileByNameUseCase: FindRuntimeProfileByNameUseCase,
    private readonly listRuntimeProfilesByCategoryUseCase: ListRuntimeProfilesByCategoryUseCase,
    private readonly getRuntimeProfileRegistryStatisticsUseCase: GetRuntimeProfileRegistryStatisticsUseCase,
  ) {}

  registerRuntimeProfile(input: RegisterRuntimeProfileInput) {
    return this.registerRuntimeProfileUseCase.execute(input);
  }

  getRuntimeProfile(runtimeProfileId: string) {
    return this.getRuntimeProfileUseCase.execute(runtimeProfileId);
  }

  listRuntimeProfiles() {
    return this.listRuntimeProfilesUseCase.execute();
  }

  updateRuntimeProfile(input: UpdateRuntimeProfileInput) {
    return this.updateRuntimeProfileUseCase.execute(input);
  }

  deleteRuntimeProfile(runtimeProfileId: string) {
    return this.deleteRuntimeProfileUseCase.execute(runtimeProfileId);
  }

  findRuntimeProfileByName(name: string) {
    return this.findRuntimeProfileByNameUseCase.execute(name);
  }

  listRuntimeProfilesByCategory(category: string) {
    return this.listRuntimeProfilesByCategoryUseCase.execute(category);
  }

  getRuntimeProfileRegistryStatistics() {
    return this.getRuntimeProfileRegistryStatisticsUseCase.execute();
  }
}
