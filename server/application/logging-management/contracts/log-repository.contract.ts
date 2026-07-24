import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

export interface ILogRepository {
  save(entry: LogEntry): Promise<void>;
  findById(logId: string): Promise<LogEntry | null>;
  delete(logId: string): Promise<void>;
  findAll(): Promise<readonly LogEntry[]>;
  clear(): Promise<number>;
}
