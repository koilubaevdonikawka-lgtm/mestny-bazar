/** Registered AI action — generic action metadata only, no domain knowledge. */
export interface Action {
  readonly actionId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterActionInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateActionInput {
  readonly actionId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListActionsResult {
  readonly actions: readonly Action[];
  readonly total: number;
}

export interface FindActionByNameResult {
  readonly action: Action | null;
}

export interface ListActionsByCategoryResult {
  readonly actions: readonly Action[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteActionResult {
  readonly actionId: string;
  readonly deleted: boolean;
}

export interface ActionRegistryStatistics {
  readonly totalActions: number;
  readonly activeActions: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createAction(input: {
  actionId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Action {
  const now = new Date().toISOString();
  return Object.freeze({
    actionId: input.actionId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
