import type {
  RegisterAuditProfileInput,
  UpdateAuditProfileInput,
} from "@server/application/ai-audit-profile-registry/models/audit-profile.model";
import {
  DeleteAuditProfileUseCase,
  FindAuditProfileByNameUseCase,
  GetAuditProfileRegistryStatisticsUseCase,
  GetAuditProfileUseCase,
  ListAuditProfilesByCategoryUseCase,
  ListAuditProfilesUseCase,
  RegisterAuditProfileUseCase,
  UpdateAuditProfileUseCase,
} from "@server/application/ai-audit-profile-registry/use-cases/ai-audit-profile-registry.use-cases";

/** Application facade for AI Audit Profile Registry scenario. */
export class AiAuditProfileRegistryApplicationService {
  constructor(
    private readonly registerAuditProfileUseCase: RegisterAuditProfileUseCase,
    private readonly getAuditProfileUseCase: GetAuditProfileUseCase,
    private readonly listAuditProfilesUseCase: ListAuditProfilesUseCase,
    private readonly updateAuditProfileUseCase: UpdateAuditProfileUseCase,
    private readonly deleteAuditProfileUseCase: DeleteAuditProfileUseCase,
    private readonly findAuditProfileByNameUseCase: FindAuditProfileByNameUseCase,
    private readonly listAuditProfilesByCategoryUseCase: ListAuditProfilesByCategoryUseCase,
    private readonly getAuditProfileRegistryStatisticsUseCase: GetAuditProfileRegistryStatisticsUseCase,
  ) {}

  registerAuditProfile(input: RegisterAuditProfileInput) {
    return this.registerAuditProfileUseCase.execute(input);
  }

  getAuditProfile(auditProfileId: string) {
    return this.getAuditProfileUseCase.execute(auditProfileId);
  }

  listAuditProfiles() {
    return this.listAuditProfilesUseCase.execute();
  }

  updateAuditProfile(input: UpdateAuditProfileInput) {
    return this.updateAuditProfileUseCase.execute(input);
  }

  deleteAuditProfile(auditProfileId: string) {
    return this.deleteAuditProfileUseCase.execute(auditProfileId);
  }

  findAuditProfileByName(name: string) {
    return this.findAuditProfileByNameUseCase.execute(name);
  }

  listAuditProfilesByCategory(category: string) {
    return this.listAuditProfilesByCategoryUseCase.execute(category);
  }

  getAuditProfileRegistryStatistics() {
    return this.getAuditProfileRegistryStatisticsUseCase.execute();
  }
}
