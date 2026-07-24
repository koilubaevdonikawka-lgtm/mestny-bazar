/** Registered AI template — generic template metadata only, no domain knowledge. */
export interface Template {
  readonly templateId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterTemplateInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateTemplateInput {
  readonly templateId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListTemplatesResult {
  readonly templates: readonly Template[];
  readonly total: number;
}

export interface FindTemplateByNameResult {
  readonly template: Template | null;
}

export interface ListTemplatesByCategoryResult {
  readonly templates: readonly Template[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteTemplateResult {
  readonly templateId: string;
  readonly deleted: boolean;
}

export interface TemplateRegistryStatistics {
  readonly totalTemplates: number;
  readonly activeTemplates: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createTemplate(input: {
  templateId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Template {
  const now = new Date().toISOString();
  return Object.freeze({
    templateId: input.templateId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
