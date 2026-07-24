import type { AuditProfile } from "@server/application/ai-audit-profile-registry/models/audit-profile.model";

export interface IAuditProfileSerializer {
  serialize(auditProfile: AuditProfile): Promise<string>;
  deserialize(serialized: string): Promise<AuditProfile>;
}
