/** Registered AI strategy — generic strategy metadata only, no domain knowledge. */
export interface Strategy {
  readonly strategyId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterStrategyInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateStrategyInput {
  readonly strategyId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListStrategiesResult {
  readonly strategies: readonly Strategy[];
  readonly total: number;
}

export interface FindStrategyByNameResult {
  readonly strategy: Strategy | null;
}

export interface ListStrategiesByCategoryResult {
  readonly strategies: readonly Strategy[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteStrategyResult {
  readonly strategyId: string;
  readonly deleted: boolean;
}

export interface StrategyRegistryStatistics {
  readonly totalStrategies: number;
  readonly activeStrategies: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createStrategy(input: {
  strategyId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Strategy {
  const now = new Date().toISOString();
  return Object.freeze({
    strategyId: input.strategyId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
