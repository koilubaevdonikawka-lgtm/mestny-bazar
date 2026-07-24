import type { AuthorizationDecision } from "@server/application/authorization-management/models/authorization.model";

export interface AuthorizationAuditRecord {
  readonly userId: string;
  readonly checkType: string;
  readonly action?: string;
  readonly resource?: string;
  readonly role?: string;
  readonly permission?: string;
  readonly decision: AuthorizationDecision;
}

export interface IAuthorizationAuditProvider {
  recordCheck(record: AuthorizationAuditRecord): Promise<void>;
}
