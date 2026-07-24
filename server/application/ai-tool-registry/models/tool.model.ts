/** Registered AI tool — generic metadata only, no domain knowledge. */
export interface AiTool {
  readonly toolId: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly schema: unknown;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterToolInput {
  readonly name: string;
  readonly description?: string;
  readonly category?: string;
  readonly schema?: unknown;
  readonly status?: "active" | "inactive";
}

export interface UpdateToolInput {
  readonly toolId: string;
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly schema?: unknown;
  readonly status?: "active" | "inactive";
}

export interface ListToolsResult {
  readonly tools: readonly AiTool[];
  readonly total: number;
}

export interface FindToolByNameResult {
  readonly name: string;
  readonly tool: AiTool | null;
}

export interface ListToolsByCategoryResult {
  readonly category: string;
  readonly tools: readonly AiTool[];
  readonly total: number;
}

export interface DeleteToolResult {
  readonly toolId: string;
  readonly deleted: boolean;
}

export interface ToolRegistryStatistics {
  readonly totalTools: number;
  readonly totalCategories: number;
  readonly activeTools: number;
  readonly inactiveTools: number;
}

export function normalizeToolCategory(category?: string): string {
  return (category ?? "general").trim() || "general";
}

export function createAiTool(input: {
  toolId: string;
  name: string;
  description?: string;
  category?: string;
  schema?: unknown;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): AiTool {
  const now = new Date().toISOString();
  return Object.freeze({
    toolId: input.toolId,
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    category: normalizeToolCategory(input.category),
    schema: input.schema ?? Object.freeze({}),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
