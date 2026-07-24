import type { SecurityAuditEntry } from "@server/application/ai-action-security/models/security-policy.model";

export interface ISecurityAuditRepository {
  save(entry: SecurityAuditEntry): Promise<void>;
  findAll(): Promise<readonly SecurityAuditEntry[]>;
}
