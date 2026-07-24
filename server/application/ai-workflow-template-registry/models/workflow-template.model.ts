/** Registered AI workflow template — generic template metadata only, no domain knowledge. */
export interface WorkflowTemplate {
  readonly workflowTemplateId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterWorkflowTemplateInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateWorkflowTemplateInput {
  readonly workflowTemplateId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListWorkflowTemplatesResult {
  readonly workflowTemplates: readonly WorkflowTemplate[];
  readonly total: number;
}

export interface FindWorkflowTemplateByNameResult {
  readonly workflowTemplate: WorkflowTemplate | null;
}

export interface ListWorkflowTemplatesByCategoryResult {
  readonly workflowTemplates: readonly WorkflowTemplate[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteWorkflowTemplateResult {
  readonly workflowTemplateId: string;
  readonly deleted: boolean;
}

export interface WorkflowTemplateRegistryStatistics {
  readonly totalWorkflowTemplates: number;
  readonly activeWorkflowTemplates: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createWorkflowTemplate(input: {
  workflowTemplateId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): WorkflowTemplate {
  const now = new Date().toISOString();
  return Object.freeze({
    workflowTemplateId: input.workflowTemplateId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
