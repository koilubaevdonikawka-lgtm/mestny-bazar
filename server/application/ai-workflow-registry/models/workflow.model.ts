/** Registered AI workflow — generic workflow metadata only, no domain knowledge. */
export interface Workflow {
  readonly workflowId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterWorkflowInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateWorkflowInput {
  readonly workflowId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListWorkflowsResult {
  readonly workflows: readonly Workflow[];
  readonly total: number;
}

export interface FindWorkflowByNameResult {
  readonly workflow: Workflow | null;
}

export interface ListWorkflowsByCategoryResult {
  readonly workflows: readonly Workflow[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteWorkflowResult {
  readonly workflowId: string;
  readonly deleted: boolean;
}

export interface WorkflowRegistryStatistics {
  readonly totalWorkflows: number;
  readonly activeWorkflows: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createWorkflow(input: {
  workflowId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Workflow {
  const now = new Date().toISOString();
  return Object.freeze({
    workflowId: input.workflowId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
