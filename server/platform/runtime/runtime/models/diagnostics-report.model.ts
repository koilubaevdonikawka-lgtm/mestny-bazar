export interface MemoryUsageSnapshot {
  readonly rss: number;
  readonly heapTotal: number;
  readonly heapUsed: number;
  readonly external: number;
  readonly arrayBuffers: number;
}

export interface RegisteredModuleSnapshot {
  readonly id: string;
  readonly registered: boolean;
}

export interface DiagnosticsReport {
  readonly timestamp: string;
  readonly runtime: Readonly<Record<string, unknown>>;
  readonly providers: readonly Readonly<Record<string, unknown>>[];
  readonly workers: readonly string[];
  readonly modules: readonly RegisteredModuleSnapshot[];
  readonly memory: MemoryUsageSnapshot;
}
