/** AI context — generic context metadata only, no domain knowledge. */
export interface Context {
  readonly contextId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly content: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateContextInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly content: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateContextInput {
  readonly contextId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly content?: string;
  readonly status?: "active" | "inactive";
}

export interface ListContextsResult {
  readonly contexts: readonly Context[];
  readonly total: number;
}

export interface FindContextByNameResult {
  readonly context: Context | null;
}

export interface ListContextsByCategoryResult {
  readonly contexts: readonly Context[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteContextResult {
  readonly contextId: string;
  readonly deleted: boolean;
}

export interface ContextStatistics {
  readonly totalContexts: number;
  readonly activeContexts: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createContext(input: {
  contextId: string;
  name: string;
  category: string;
  description?: string;
  content: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Context {
  const now = new Date().toISOString();
  return Object.freeze({
    contextId: input.contextId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    content: input.content.trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
