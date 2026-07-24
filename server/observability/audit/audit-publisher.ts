import type { SecurityContext } from "@server/security/context";
import { AnonymousIdentity } from "@server/security/identity/anonymous-identity";
import { AuthenticatedIdentity } from "@server/security/identity/authenticated-identity";
import { ServiceIdentity } from "@server/security/identity/service-identity";
import { SystemIdentity } from "@server/security/identity/system-identity";
import {
  createAuditRecord,
  type AuditCategory,
  type AuditOutcome,
  type AuditRecord,
  type AuditSeverity,
  type CreateAuditRecordInput,
} from "@server/observability/audit/audit-record";
import type { IAuditStore } from "@server/observability/audit/i-audit-store";

export interface PublishAuditRecordInput
  extends Omit<CreateAuditRecordInput, "identityType" | "identityKey" | "correlationId" | "requestId"> {
  security: SecurityContext;
}

/** Publishes audit records to configured stores — no external vendor coupling. */
export class AuditPublisher {
  constructor(private readonly store: IAuditStore) {
    Object.freeze(this);
  }

  async publish(record: AuditRecord): Promise<void> {
    await this.store.append(record);
  }

  async publishMany(records: readonly AuditRecord[]): Promise<void> {
    await this.store.appendMany(records);
  }

  /** Builds an audit record from security and request correlation metadata. */
  createFromSecurityContext(input: PublishAuditRecordInput): AuditRecord {
    return createAuditRecord({
      ...input,
      correlationId: input.security.correlationId,
      requestId: input.security.requestId,
      identityType: input.security.identity.type,
      identityKey: resolveIdentityKey(input.security),
    });
  }

  async publishFromSecurityContext(input: PublishAuditRecordInput): Promise<AuditRecord> {
    const record = this.createFromSecurityContext(input);
    await this.publish(record);
    return record;
  }
}

function resolveIdentityKey(security: SecurityContext): string {
  const { identity } = security;

  if (identity instanceof AuthenticatedIdentity) {
    return identity.userId;
  }
  if (identity instanceof ServiceIdentity) {
    return identity.serviceId;
  }
  if (identity instanceof SystemIdentity) {
    return identity.systemName;
  }
  if (identity instanceof AnonymousIdentity) {
    return "anonymous";
  }

  return identity.type;
}

export type { AuditCategory, AuditOutcome, AuditRecord, AuditSeverity };
