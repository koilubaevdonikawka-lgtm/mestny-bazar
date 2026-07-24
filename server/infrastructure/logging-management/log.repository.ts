import type { ILogRepository } from "@server/application/logging-management/contracts/log-repository.contract";
import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

/** In-memory log entry store. */
export class LogRepository implements ILogRepository {
  private readonly logs = new Map<string, LogEntry>();

  async save(entry: LogEntry): Promise<void> {
    this.logs.set(entry.logId, entry);
  }

  async findById(logId: string): Promise<LogEntry | null> {
    return this.logs.get(logId.trim()) ?? null;
  }

  async delete(logId: string): Promise<void> {
    this.logs.delete(logId.trim());
  }

  async findAll(): Promise<readonly LogEntry[]> {
    return Object.freeze([...this.logs.values()]);
  }

  async clear(): Promise<number> {
    const count = this.logs.size;
    this.logs.clear();
    return count;
  }
}
