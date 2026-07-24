import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

export interface IAuditProfileCatalog {
  register(auditProfile: AuditProfile): Promise<void>;
  remove(auditProfileId: string): Promise<void>;
  findById(auditProfileId: string): Promise<AuditProfile | null>;
  findByName(name: string): Promise<AuditProfile | null>;
  findByCategory(category: string): Promise<readonly AuditProfile[]>;
  listAll(): Promise<readonly AuditProfile[]>;
}
