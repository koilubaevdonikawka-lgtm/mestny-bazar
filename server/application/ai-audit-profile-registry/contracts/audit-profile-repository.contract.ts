import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

export interface IAuditProfileRepository {
  save(auditProfile: AuditProfile): Promise<void>;
  findById(auditProfileId: string): Promise<AuditProfile | null>;
  findByName(name: string): Promise<AuditProfile | null>;
  findByCategory(category: string): Promise<readonly AuditProfile[]>;
  findAll(): Promise<readonly AuditProfile[]>;
  delete(auditProfileId: string): Promise<boolean>;
}
