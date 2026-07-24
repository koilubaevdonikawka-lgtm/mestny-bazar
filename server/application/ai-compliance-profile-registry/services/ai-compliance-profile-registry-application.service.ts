import type {
  RegisterComplianceProfileInput,
  UpdateComplianceProfileInput,
} from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";
import {
  DeleteComplianceProfileUseCase,
  FindComplianceProfileByNameUseCase,
  GetComplianceProfileRegistryStatisticsUseCase,
  GetComplianceProfileUseCase,
  ListComplianceProfilesByCategoryUseCase,
  ListComplianceProfilesUseCase,
  RegisterComplianceProfileUseCase,
  UpdateComplianceProfileUseCase,
} from "@server/application/ai-compliance-profile-registry/use-cases/ai-compliance-profile-registry.use-cases";

/** Application facade for AI Compliance Profile Registry scenario. */
export class AiComplianceProfileRegistryApplicationService {
  constructor(
    private readonly registerComplianceProfileUseCase: RegisterComplianceProfileUseCase,
    private readonly getComplianceProfileUseCase: GetComplianceProfileUseCase,
    private readonly listComplianceProfilesUseCase: ListComplianceProfilesUseCase,
    private readonly updateComplianceProfileUseCase: UpdateComplianceProfileUseCase,
    private readonly deleteComplianceProfileUseCase: DeleteComplianceProfileUseCase,
    private readonly findComplianceProfileByNameUseCase: FindComplianceProfileByNameUseCase,
    private readonly listComplianceProfilesByCategoryUseCase: ListComplianceProfilesByCategoryUseCase,
    private readonly getComplianceProfileRegistryStatisticsUseCase: GetComplianceProfileRegistryStatisticsUseCase,
  ) {}

  registerComplianceProfile(input: RegisterComplianceProfileInput) {
    return this.registerComplianceProfileUseCase.execute(input);
  }

  getComplianceProfile(complianceProfileId: string) {
    return this.getComplianceProfileUseCase.execute(complianceProfileId);
  }

  listComplianceProfiles() {
    return this.listComplianceProfilesUseCase.execute();
  }

  updateComplianceProfile(input: UpdateComplianceProfileInput) {
    return this.updateComplianceProfileUseCase.execute(input);
  }

  deleteComplianceProfile(complianceProfileId: string) {
    return this.deleteComplianceProfileUseCase.execute(complianceProfileId);
  }

  findComplianceProfileByName(name: string) {
    return this.findComplianceProfileByNameUseCase.execute(name);
  }

  listComplianceProfilesByCategory(category: string) {
    return this.listComplianceProfilesByCategoryUseCase.execute(category);
  }

  getComplianceProfileRegistryStatistics() {
    return this.getComplianceProfileRegistryStatisticsUseCase.execute();
  }
}
