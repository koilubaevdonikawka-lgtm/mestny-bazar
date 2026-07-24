import type { ISecurityAuditRepository } from "@server/application/ai-action-security/contracts/security-audit-repository.contract";
import type { SecurityAuditEntry } from "@server/application/ai-action-security/models/security-policy.model";

/** In-memory security audit history store. */
export class SecurityAuditRepository implements ISecurityAuditRepository {
  private readonly entries: SecurityAuditEntry[] = [];

  async save(entry: SecurityAuditEntry): Promise<void> {
    this.entries.push(entry);
  }

  async findAll(): Promise<readonly SecurityAuditEntry[]> {
    return Object.freeze([...this.entries]);
  }
}
