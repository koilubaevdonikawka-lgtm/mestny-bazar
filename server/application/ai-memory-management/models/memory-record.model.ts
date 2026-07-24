/** Registered memory record — generic AI memory only, no domain knowledge. */
export interface MemoryRecord {
  readonly memoryId: string;
  readonly key: string;
  readonly category: string;
  readonly description: string;
  readonly data: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterMemoryRecordInput {
  readonly key: string;
  readonly category: string;
  readonly description?: string;
  readonly data?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateMemoryRecordInput {
  readonly memoryId: string;
  readonly key?: string;
  readonly category?: string;
  readonly description?: string;
  readonly data?: unknown;
  readonly status?: "active" | "inactive";
}

export interface ListMemoryRecordsResult {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
}

export interface FindMemoryRecordsByKeyResult {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
  readonly key: string;
}

export interface ListMemoryRecordsByCategoryResult {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteMemoryRecordResult {
  readonly memoryId: string;
  readonly deleted: boolean;
}

export interface MemoryStatistics {
  readonly totalRecords: number;
  readonly activeRecords: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createMemoryRecord(input: {
  memoryId: string;
  key: string;
  category: string;
  description?: string;
  data?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): MemoryRecord {
  const now = new Date().toISOString();
  return Object.freeze({
    memoryId: input.memoryId,
    key: input.key.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    data: input.data ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
