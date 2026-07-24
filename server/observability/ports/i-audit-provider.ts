import type { AuditPublisher } from "@server/observability/audit";
import type { IAuditStore } from "@server/observability/audit/i-audit-store";

/** Provides audit publishing and storage components. */
export interface IAuditProvider {
  getPublisher(): AuditPublisher;
  getStore(): IAuditStore;
}
