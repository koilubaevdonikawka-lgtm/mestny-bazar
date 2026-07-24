/** Registered AI prompt — generic prompt metadata only, no domain knowledge. */
export interface Prompt {
  readonly promptId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly content: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterPromptInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly content: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdatePromptInput {
  readonly promptId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly content?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListPromptsResult {
  readonly prompts: readonly Prompt[];
  readonly total: number;
}

export interface FindPromptByNameResult {
  readonly prompt: Prompt | null;
}

export interface ListPromptsByCategoryResult {
  readonly prompts: readonly Prompt[];
  readonly total: number;
  readonly category: string;
}

export interface DeletePromptResult {
  readonly promptId: string;
  readonly deleted: boolean;
}

export interface PromptRegistryStatistics {
  readonly totalPrompts: number;
  readonly activePrompts: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createPrompt(input: {
  promptId: string;
  name: string;
  category: string;
  description?: string;
  content: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Prompt {
  const now = new Date().toISOString();
  return Object.freeze({
    promptId: input.promptId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    content: input.content.trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
