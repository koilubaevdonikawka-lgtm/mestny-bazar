import type {
  RegisterPolicyProfileInput,
  UpdatePolicyProfileInput,
} from "@server/application/ai-policy-profile-registry/models/policy-profile.model";
import {
  DeletePolicyProfileUseCase,
  FindPolicyProfileByNameUseCase,
  GetPolicyProfileRegistryStatisticsUseCase,
  GetPolicyProfileUseCase,
  ListPolicyProfilesByCategoryUseCase,
  ListPolicyProfilesUseCase,
  RegisterPolicyProfileUseCase,
  UpdatePolicyProfileUseCase,
} from "@server/application/ai-policy-profile-registry/use-cases/ai-policy-profile-registry.use-cases";

/** Application facade for AI Policy Profile Registry scenario. */
export class AiPolicyProfileRegistryApplicationService {
  constructor(
    private readonly registerPolicyProfileUseCase: RegisterPolicyProfileUseCase,
    private readonly getPolicyProfileUseCase: GetPolicyProfileUseCase,
    private readonly listPolicyProfilesUseCase: ListPolicyProfilesUseCase,
    private readonly updatePolicyProfileUseCase: UpdatePolicyProfileUseCase,
    private readonly deletePolicyProfileUseCase: DeletePolicyProfileUseCase,
    private readonly findPolicyProfileByNameUseCase: FindPolicyProfileByNameUseCase,
    private readonly listPolicyProfilesByCategoryUseCase: ListPolicyProfilesByCategoryUseCase,
    private readonly getPolicyProfileRegistryStatisticsUseCase: GetPolicyProfileRegistryStatisticsUseCase,
  ) {}

  registerPolicyProfile(input: RegisterPolicyProfileInput) {
    return this.registerPolicyProfileUseCase.execute(input);
  }

  getPolicyProfile(policyProfileId: string) {
    return this.getPolicyProfileUseCase.execute(policyProfileId);
  }

  listPolicyProfiles() {
    return this.listPolicyProfilesUseCase.execute();
  }

  updatePolicyProfile(input: UpdatePolicyProfileInput) {
    return this.updatePolicyProfileUseCase.execute(input);
  }

  deletePolicyProfile(policyProfileId: string) {
    return this.deletePolicyProfileUseCase.execute(policyProfileId);
  }

  findPolicyProfileByName(name: string) {
    return this.findPolicyProfileByNameUseCase.execute(name);
  }

  listPolicyProfilesByCategory(category: string) {
    return this.listPolicyProfilesByCategoryUseCase.execute(category);
  }

  getPolicyProfileRegistryStatistics() {
    return this.getPolicyProfileRegistryStatisticsUseCase.execute();
  }
}
