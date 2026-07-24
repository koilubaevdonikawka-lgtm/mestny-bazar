/**
 * Audit Management — audit event registration only.
 *
 * Fully independent module. Does not modify business data or participate in business logic.
 */
import type { IAuditEventPublisher } from "@server/application/audit-management/contracts/audit-event-publisher.contract";
import type { IAuditFormatter } from "@server/application/audit-management/contracts/audit-formatter.contract";
import type { IAuditRepository } from "@server/application/audit-management/contracts/audit-repository.contract";
import type { IAuditRetentionPolicy } from "@server/application/audit-management/contracts/audit-retention-policy.contract";
import {
  createAuditEntry,
  type AuditDateRangeQuery,
  type AuditEntry,
  type AuditLogResult,
  type WriteAuditEntryInput,
} from "@server/application/audit-management/models/audit-entry.model";
import type { IIdGenerator } from "@server/application/ports";

export class AuditManagementService {
  constructor(
    private readonly auditRepository: IAuditRepository,
    private readonly formatter: IAuditFormatter,
    private readonly retentionPolicy: IAuditRetentionPolicy,
    private readonly eventPublisher: IAuditEventPublisher,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async writeEntry(input: WriteAuditEntryInput): Promise<AuditEntry> {
    const formattedMessage = this.formatter.format(input);
    const entry = createAuditEntry({
      auditId: this.idGenerator.generate(),
      userId: input.userId,
      module: input.module,
      eventType: input.eventType,
      resourceId: input.resourceId,
      message: input.message,
      formattedMessage,
      metadata: input.metadata,
    });

    if (!this.retentionPolicy.shouldRetain(entry)) {
      throw new Error("Audit entry rejected by retention policy.");
    }

    await this.auditRepository.save(entry);
    await this.eventPublisher.publishAuditWritten(entry);

    return entry;
  }

  async getEntry(auditId: string): Promise<AuditEntry | null> {
    return this.auditRepository.findById(auditId);
  }

  async getLog(): Promise<AuditLogResult> {
    const entries = await this.auditRepository.findAll();
    return toLogResult(entries);
  }

  async getByUser(userId: string): Promise<AuditLogResult> {
    const entries = await this.auditRepository.findByUserId(userId);
    return toLogResult(entries);
  }

  async getByModule(module: string): Promise<AuditLogResult> {
    const entries = await this.auditRepository.findByModule(module);
    return toLogResult(entries);
  }

  async getByEventType(eventType: string): Promise<AuditLogResult> {
    const entries = await this.auditRepository.findByEventType(eventType);
    return toLogResult(entries);
  }

  async getByDateRange(query: AuditDateRangeQuery): Promise<AuditLogResult> {
    const entries = await this.auditRepository.findByDateRange(query.from, query.to);
    return toLogResult(entries);
  }

}

function toLogResult(entries: readonly AuditEntry[]): AuditLogResult {
  return Object.freeze({
    entries: Object.freeze(
      [...entries].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)),
    ),
    total: entries.length,
  });
}
