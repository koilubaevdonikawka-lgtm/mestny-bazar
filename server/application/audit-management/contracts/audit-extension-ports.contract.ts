/**
 * Future integration ports for Audit Management.
 * Not implemented — reserved for external compliance and security systems.
 */

import type { AuditEntry } from "@server/application/audit-management/models/audit-entry.model";

/** Compliance Engine — regulatory audit trail validation. */
export interface IComplianceEngine {
  validateEntry(entry: AuditEntry): Promise<{ compliant: boolean; violations: readonly string[] }>;
  generateComplianceReport(module: string): Promise<unknown>;
}

/** Immutable Audit Store — append-only tamper-proof storage. */
export interface IImmutableAuditStore {
  appendImmutable(entry: AuditEntry): Promise<string>;
  verifyIntegrity(auditId: string): Promise<boolean>;
}

/** Security Monitoring — real-time threat detection from audit events. */
export interface ISecurityMonitoring {
  analyzeEntry(entry: AuditEntry): Promise<{ riskLevel: string; alerts: readonly string[] }>;
  subscribeToAlerts(callback: (alert: string) => void): Promise<void>;
}

/** SIEM Integration — export to security information systems. */
export interface ISiemIntegration {
  forwardEntry(entry: AuditEntry): Promise<void>;
  forwardBatch(entries: readonly AuditEntry[]): Promise<void>;
}

/** Archive Storage — long-term cold storage for audit logs. */
export interface IArchiveStorage {
  archiveEntries(entries: readonly AuditEntry[]): Promise<string>;
  restoreArchive(archiveId: string): Promise<readonly AuditEntry[]>;
}
