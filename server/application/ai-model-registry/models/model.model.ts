/** Registered AI model — generic model metadata only, no domain knowledge. */
export interface Model {
  readonly modelId: string;
  readonly name: string;
  readonly provider: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterModelInput {
  readonly name: string;
  readonly provider: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateModelInput {
  readonly modelId: string;
  readonly name?: string;
  readonly provider?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListModelsResult {
  readonly models: readonly Model[];
  readonly total: number;
}

export interface FindModelByNameResult {
  readonly model: Model | null;
}

export interface ListModelsByProviderResult {
  readonly models: readonly Model[];
  readonly total: number;
  readonly provider: string;
}

export interface DeleteModelResult {
  readonly modelId: string;
  readonly deleted: boolean;
}

export interface ModelRegistryStatistics {
  readonly totalModels: number;
  readonly activeModels: number;
  readonly providerCount: number;
  readonly providers: readonly string[];
}

export function createModel(input: {
  modelId: string;
  name: string;
  provider: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Model {
  const now = new Date().toISOString();
  return Object.freeze({
    modelId: input.modelId,
    name: input.name.trim(),
    provider: input.provider.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
