/**
 * Future integration ports for Logging Management.
 * Not implemented — reserved for external logging systems.
 */

import type { LogEntry } from "@server/application/logging-management/models/log-entry.model";

/** Elasticsearch Log Provider — Elasticsearch integration. */
export interface IElasticSearchLogProvider {
  indexLog(entry: LogEntry): Promise<void>;
  searchLogs(query: string): Promise<readonly LogEntry[]>;
}

/** OpenSearch Provider — OpenSearch integration. */
export interface IOpenSearchProvider {
  indexLog(entry: LogEntry): Promise<void>;
  searchLogs(query: string): Promise<readonly LogEntry[]>;
}

/** Loki Provider — Grafana Loki integration. */
export interface ILokiProvider {
  pushLog(entry: LogEntry): Promise<void>;
  queryLogs(query: string): Promise<readonly LogEntry[]>;
}

/** Cloud Logging Provider — cloud platform logging integration. */
export interface ICloudLoggingProvider {
  writeLog(entry: LogEntry): Promise<void>;
  fetchLogs(filter: string): Promise<readonly LogEntry[]>;
}

/** Log Streaming Provider — real-time log streaming. */
export interface ILogStreamingProvider {
  publishLog(entry: LogEntry): Promise<void>;
  subscribe(callback: (entry: LogEntry) => void): Promise<void>;
}
