import type { AuditDateRangeQuery, AuditEntry, AuditLogResult, WriteAuditEntryInput } from "@server/application/audit-management/models/audit-entry.model";
import type { AuditManagementService } from "@server/application/audit-management/services/audit-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class WriteAuditEntryUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  execute(input: WriteAuditEntryInput): Promise<UseCaseResult<AuditEntry>> {
    return this.audit.writeEntry(input).then(useCaseResult);
  }
}

export class GetAuditEntryUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  async execute(auditId: string): Promise<UseCaseResult<AuditEntry | null>> {
    return useCaseResult(await this.audit.getEntry(auditId));
  }
}

export class GetAuditLogUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  execute(): Promise<UseCaseResult<AuditLogResult>> {
    return this.audit.getLog().then(useCaseResult);
  }
}

export class GetAuditByUserUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  execute(userId: string): Promise<UseCaseResult<AuditLogResult>> {
    return this.audit.getByUser(userId).then(useCaseResult);
  }
}

export class GetAuditByModuleUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  execute(module: string): Promise<UseCaseResult<AuditLogResult>> {
    return this.audit.getByModule(module).then(useCaseResult);
  }
}

export class GetAuditByEventTypeUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  execute(eventType: string): Promise<UseCaseResult<AuditLogResult>> {
    return this.audit.getByEventType(eventType).then(useCaseResult);
  }
}

export class GetAuditByDateRangeUseCase {
  constructor(private readonly audit: AuditManagementService) {}

  execute(query: AuditDateRangeQuery): Promise<UseCaseResult<AuditLogResult>> {
    return this.audit.getByDateRange(query).then(useCaseResult);
  }
}
