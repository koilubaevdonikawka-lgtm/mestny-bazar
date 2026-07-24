import {
  GetAuditByDateRangeUseCase,
  GetAuditByEventTypeUseCase,
  GetAuditByModuleUseCase,
  GetAuditByUserUseCase,
  GetAuditEntryUseCase,
  GetAuditLogUseCase,
  WriteAuditEntryUseCase,
} from "@server/application/audit-management/use-cases/audit-management.use-cases";
import type { AuditDateRangeQuery, WriteAuditEntryInput } from "@server/application/audit-management/models/audit-entry.model";

/** Application facade for audit management scenario. */
export class AuditManagementApplicationService {
  constructor(
    private readonly writeAuditEntryUseCase: WriteAuditEntryUseCase,
    private readonly getAuditEntryUseCase: GetAuditEntryUseCase,
    private readonly getAuditLogUseCase: GetAuditLogUseCase,
    private readonly getAuditByUserUseCase: GetAuditByUserUseCase,
    private readonly getAuditByModuleUseCase: GetAuditByModuleUseCase,
    private readonly getAuditByEventTypeUseCase: GetAuditByEventTypeUseCase,
    private readonly getAuditByDateRangeUseCase: GetAuditByDateRangeUseCase,
  ) {}

  writeAuditEntry(input: WriteAuditEntryInput) {
    return this.writeAuditEntryUseCase.execute(input);
  }

  getAuditEntry(auditId: string) {
    return this.getAuditEntryUseCase.execute(auditId);
  }

  getAuditLog() {
    return this.getAuditLogUseCase.execute();
  }

  getAuditByUser(userId: string) {
    return this.getAuditByUserUseCase.execute(userId);
  }

  getAuditByModule(module: string) {
    return this.getAuditByModuleUseCase.execute(module);
  }

  getAuditByEventType(eventType: string) {
    return this.getAuditByEventTypeUseCase.execute(eventType);
  }

  getAuditByDateRange(query: AuditDateRangeQuery) {
    return this.getAuditByDateRangeUseCase.execute(query);
  }
}
