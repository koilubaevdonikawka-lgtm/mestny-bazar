import type {
  RegisterSecurityProfileInput,
  UpdateSecurityProfileInput,
} from "@server/application/ai-security-profile-registry/models/security-profile.model";
import {
  DeleteSecurityProfileUseCase,
  FindSecurityProfileByNameUseCase,
  GetSecurityProfileRegistryStatisticsUseCase,
  GetSecurityProfileUseCase,
  ListSecurityProfilesByCategoryUseCase,
  ListSecurityProfilesUseCase,
  RegisterSecurityProfileUseCase,
  UpdateSecurityProfileUseCase,
} from "@server/application/ai-security-profile-registry/use-cases/ai-security-profile-registry.use-cases";

/** Application facade for AI Security Profile Registry scenario. */
export class AiSecurityProfileRegistryApplicationService {
  constructor(
    private readonly registerSecurityProfileUseCase: RegisterSecurityProfileUseCase,
    private readonly getSecurityProfileUseCase: GetSecurityProfileUseCase,
    private readonly listSecurityProfilesUseCase: ListSecurityProfilesUseCase,
    private readonly updateSecurityProfileUseCase: UpdateSecurityProfileUseCase,
    private readonly deleteSecurityProfileUseCase: DeleteSecurityProfileUseCase,
    private readonly findSecurityProfileByNameUseCase: FindSecurityProfileByNameUseCase,
    private readonly listSecurityProfilesByCategoryUseCase: ListSecurityProfilesByCategoryUseCase,
    private readonly getSecurityProfileRegistryStatisticsUseCase: GetSecurityProfileRegistryStatisticsUseCase,
  ) {}

  registerSecurityProfile(input: RegisterSecurityProfileInput) {
    return this.registerSecurityProfileUseCase.execute(input);
  }

  getSecurityProfile(securityProfileId: string) {
    return this.getSecurityProfileUseCase.execute(securityProfileId);
  }

  listSecurityProfiles() {
    return this.listSecurityProfilesUseCase.execute();
  }

  updateSecurityProfile(input: UpdateSecurityProfileInput) {
    return this.updateSecurityProfileUseCase.execute(input);
  }

  deleteSecurityProfile(securityProfileId: string) {
    return this.deleteSecurityProfileUseCase.execute(securityProfileId);
  }

  findSecurityProfileByName(name: string) {
    return this.findSecurityProfileByNameUseCase.execute(name);
  }

  listSecurityProfilesByCategory(category: string) {
    return this.listSecurityProfilesByCategoryUseCase.execute(category);
  }

  getSecurityProfileRegistryStatistics() {
    return this.getSecurityProfileRegistryStatisticsUseCase.execute();
  }
}
