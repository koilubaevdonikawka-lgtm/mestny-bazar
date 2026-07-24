import type {
  DeleteAuditProfileResult,
  FindAuditProfileByNameResult,
  AuditProfile,
  AuditProfileRegistryStatistics,
  ListAuditProfilesByCategoryResult,
  ListAuditProfilesResult,
  RegisterAuditProfileInput,
  UpdateAuditProfileInput,
} from "@server/application/ai-audit-profile-registry/models/audit-profile.model";
import type { AiAuditProfileRegistryService } from "@server/application/ai-audit-profile-registry/services/ai-audit-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterAuditProfileUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(input: RegisterAuditProfileInput): Promise<UseCaseResult<AuditProfile>> {
    return this.auditProfileRegistry.registerAuditProfile(input).then(useCaseResult);
  }
}

export class GetAuditProfileUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(auditProfileId: string): Promise<UseCaseResult<AuditProfile | null>> {
    return this.auditProfileRegistry.getAuditProfile(auditProfileId).then(useCaseResult);
  }
}

export class ListAuditProfilesUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListAuditProfilesResult>> {
    return this.auditProfileRegistry.listAuditProfiles().then(useCaseResult);
  }
}

export class UpdateAuditProfileUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(input: UpdateAuditProfileInput): Promise<UseCaseResult<AuditProfile>> {
    return this.auditProfileRegistry.updateAuditProfile(input).then(useCaseResult);
  }
}

export class DeleteAuditProfileUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(auditProfileId: string): Promise<UseCaseResult<DeleteAuditProfileResult>> {
    return this.auditProfileRegistry.deleteAuditProfile(auditProfileId).then(useCaseResult);
  }
}

export class FindAuditProfileByNameUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindAuditProfileByNameResult>> {
    return this.auditProfileRegistry.findAuditProfileByName(name).then(useCaseResult);
  }
}

export class ListAuditProfilesByCategoryUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListAuditProfilesByCategoryResult>> {
    return this.auditProfileRegistry.listAuditProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetAuditProfileRegistryStatisticsUseCase {
  constructor(private readonly auditProfileRegistry: AiAuditProfileRegistryService) {}

  execute(): Promise<UseCaseResult<AuditProfileRegistryStatistics>> {
    return this.auditProfileRegistry.getAuditProfileRegistryStatistics().then(useCaseResult);
  }
}
