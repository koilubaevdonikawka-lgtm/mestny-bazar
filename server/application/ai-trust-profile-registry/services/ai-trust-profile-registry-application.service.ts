import type {
  RegisterTrustProfileInput,
  UpdateTrustProfileInput,
} from "@server/application/ai-trust-profile-registry/models/trust-profile.model";
import {
  DeleteTrustProfileUseCase,
  FindTrustProfileByNameUseCase,
  GetTrustProfileRegistryStatisticsUseCase,
  GetTrustProfileUseCase,
  ListTrustProfilesByCategoryUseCase,
  ListTrustProfilesUseCase,
  RegisterTrustProfileUseCase,
  UpdateTrustProfileUseCase,
} from "@server/application/ai-trust-profile-registry/use-cases/ai-trust-profile-registry.use-cases";

/** Application facade for AI Trust Profile Registry scenario. */
export class AiTrustProfileRegistryApplicationService {
  constructor(
    private readonly registerTrustProfileUseCase: RegisterTrustProfileUseCase,
    private readonly getTrustProfileUseCase: GetTrustProfileUseCase,
    private readonly listTrustProfilesUseCase: ListTrustProfilesUseCase,
    private readonly updateTrustProfileUseCase: UpdateTrustProfileUseCase,
    private readonly deleteTrustProfileUseCase: DeleteTrustProfileUseCase,
    private readonly findTrustProfileByNameUseCase: FindTrustProfileByNameUseCase,
    private readonly listTrustProfilesByCategoryUseCase: ListTrustProfilesByCategoryUseCase,
    private readonly getTrustProfileRegistryStatisticsUseCase: GetTrustProfileRegistryStatisticsUseCase,
  ) {}

  registerTrustProfile(input: RegisterTrustProfileInput) {
    return this.registerTrustProfileUseCase.execute(input);
  }

  getTrustProfile(trustProfileId: string) {
    return this.getTrustProfileUseCase.execute(trustProfileId);
  }

  listTrustProfiles() {
    return this.listTrustProfilesUseCase.execute();
  }

  updateTrustProfile(input: UpdateTrustProfileInput) {
    return this.updateTrustProfileUseCase.execute(input);
  }

  deleteTrustProfile(trustProfileId: string) {
    return this.deleteTrustProfileUseCase.execute(trustProfileId);
  }

  findTrustProfileByName(name: string) {
    return this.findTrustProfileByNameUseCase.execute(name);
  }

  listTrustProfilesByCategory(category: string) {
    return this.listTrustProfilesByCategoryUseCase.execute(category);
  }

  getTrustProfileRegistryStatistics() {
    return this.getTrustProfileRegistryStatisticsUseCase.execute();
  }
}
