/**
 * Logging Management — system log registration and retrieval only.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ILogExporter } from "@server/application/logging-management/contracts/log-exporter.contract";
import type { ILogFilter } from "@server/application/logging-management/contracts/log-filter.contract";
import type { ILogFormatter } from "@server/application/logging-management/contracts/log-formatter.contract";
import type { ILogRepository } from "@server/application/logging-management/contracts/log-repository.contract";
import type { ILogRetentionPolicy } from "@server/application/logging-management/contracts/log-retention-policy.contract";
import {
  createLogEntry,
  type ClearLogsResult,
  type ExportLogsResult,
  type FilterLogsInput,
  type ListLogsResult,
  type LogEntry,
  type SearchLogsInput,
  type WriteLogInput,
} from "@server/application/logging-management/models/log-entry.model";
import type { IIdGenerator } from "@server/application/ports";

export class LoggingManagementService {
  constructor(
    private readonly logRepository: ILogRepository,
    private readonly formatter: ILogFormatter,
    private readonly logFilter: ILogFilter,
    private readonly logExporter: ILogExporter,
    private readonly retentionPolicy: ILogRetentionPolicy,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async writeLog(input: WriteLogInput): Promise<LogEntry> {
    const entry = createLogEntry({
      logId: this.idGenerator.generate(),
      level: input.level,
      message: input.message,
      source: input.source,
      context: input.context,
      formattedMessage: this.formatter.format(input),
    });

    if (!this.retentionPolicy.shouldRetain(entry)) {
      throw new Error("Log entry rejected by retention policy.");
    }

    await this.logRepository.save(entry);
    await this.enforceRetentionLimit();
    return entry;
  }

  async getLog(logId: string): Promise<LogEntry | null> {
    return this.logRepository.findById(logId.trim());
  }

  async listLogs(): Promise<ListLogsResult> {
    return this.toListResult(await this.logRepository.findAll());
  }

  async deleteLog(logId: string): Promise<{ logId: string; deleted: boolean }> {
    const normalizedLogId = logId.trim();
    if (!(await this.logRepository.findById(normalizedLogId))) {
      throw new Error(`Log entry not found: ${normalizedLogId}`);
    }

    await this.logRepository.delete(normalizedLogId);
    return Object.freeze({ logId: normalizedLogId, deleted: true });
  }

  async clearLogs(): Promise<ClearLogsResult> {
    const removedCount = await this.logRepository.clear();
    return Object.freeze({ removedCount });
  }

  async searchLogs(input: SearchLogsInput): Promise<ListLogsResult> {
    const entries = await this.logRepository.findAll();
    const matched = this.logFilter.search(entries, input.query.trim());
    return this.toListResult(matched);
  }

  async filterLogs(input: FilterLogsInput): Promise<ListLogsResult> {
    const entries = await this.logRepository.findAll();
    const matched = this.logFilter.filter(entries, input);
    return this.toListResult(matched);
  }

  async exportLogs(): Promise<ExportLogsResult> {
    const entries = await this.logRepository.findAll();
    const payload = await this.logExporter.export(entries);

    return Object.freeze({
      format: "json",
      payload,
      count: entries.length,
    });
  }

  private async enforceRetentionLimit(): Promise<void> {
    const maxEntries = this.retentionPolicy.getMaxEntries();
    const entries = await this.logRepository.findAll();
    if (entries.length <= maxEntries) {
      return;
    }

    const toRemove = entries.length - maxEntries;
    const oldest = [...entries]
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .slice(0, toRemove);

    for (const entry of oldest) {
      await this.logRepository.delete(entry.logId);
    }
  }

  private toListResult(entries: readonly LogEntry[]): ListLogsResult {
    const sorted = Object.freeze(
      [...entries].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );

    return Object.freeze({
      entries: sorted,
      total: sorted.length,
    });
  }
}
