import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

export interface IAuditRepository {
  save(entry: AuditEntry): Promise<void>;
  findById(auditId: string): Promise<AuditEntry | null>;
  findAll(): Promise<readonly AuditEntry[]>;
  findByUserId(userId: string): Promise<readonly AuditEntry[]>;
  findByModule(module: string): Promise<readonly AuditEntry[]>;
  findByEventType(eventType: string): Promise<readonly AuditEntry[]>;
  findByDateRange(from: string, to: string): Promise<readonly AuditEntry[]>;
}
