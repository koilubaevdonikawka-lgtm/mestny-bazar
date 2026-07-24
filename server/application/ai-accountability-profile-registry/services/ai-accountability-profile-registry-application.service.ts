import type {
  RegisterAccountabilityProfileInput,
  UpdateAccountabilityProfileInput,
} from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";
import {
  DeleteAccountabilityProfileUseCase,
  FindAccountabilityProfileByNameUseCase,
  GetAccountabilityProfileRegistryStatisticsUseCase,
  GetAccountabilityProfileUseCase,
  ListAccountabilityProfilesByCategoryUseCase,
  ListAccountabilityProfilesUseCase,
  RegisterAccountabilityProfileUseCase,
  UpdateAccountabilityProfileUseCase,
} from "@server/application/ai-accountability-profile-registry/use-cases/ai-accountability-profile-registry.use-cases";

/** Application facade for AI Accountability Profile Registry scenario. */
export class AiAccountabilityProfileRegistryApplicationService {
  constructor(
    private readonly registerAccountabilityProfileUseCase: RegisterAccountabilityProfileUseCase,
    private readonly getAccountabilityProfileUseCase: GetAccountabilityProfileUseCase,
    private readonly listAccountabilityProfilesUseCase: ListAccountabilityProfilesUseCase,
    private readonly updateAccountabilityProfileUseCase: UpdateAccountabilityProfileUseCase,
    private readonly deleteAccountabilityProfileUseCase: DeleteAccountabilityProfileUseCase,
    private readonly findAccountabilityProfileByNameUseCase: FindAccountabilityProfileByNameUseCase,
    private readonly listAccountabilityProfilesByCategoryUseCase: ListAccountabilityProfilesByCategoryUseCase,
    private readonly getAccountabilityProfileRegistryStatisticsUseCase: GetAccountabilityProfileRegistryStatisticsUseCase,
  ) {}

  registerAccountabilityProfile(input: RegisterAccountabilityProfileInput) {
    return this.registerAccountabilityProfileUseCase.execute(input);
  }

  getAccountabilityProfile(accountabilityProfileId: string) {
    return this.getAccountabilityProfileUseCase.execute(accountabilityProfileId);
  }

  listAccountabilityProfiles() {
    return this.listAccountabilityProfilesUseCase.execute();
  }

  updateAccountabilityProfile(input: UpdateAccountabilityProfileInput) {
    return this.updateAccountabilityProfileUseCase.execute(input);
  }

  deleteAccountabilityProfile(accountabilityProfileId: string) {
    return this.deleteAccountabilityProfileUseCase.execute(accountabilityProfileId);
  }

  findAccountabilityProfileByName(name: string) {
    return this.findAccountabilityProfileByNameUseCase.execute(name);
  }

  listAccountabilityProfilesByCategory(category: string) {
    return this.listAccountabilityProfilesByCategoryUseCase.execute(category);
  }

  getAccountabilityProfileRegistryStatistics() {
    return this.getAccountabilityProfileRegistryStatisticsUseCase.execute();
  }
}
