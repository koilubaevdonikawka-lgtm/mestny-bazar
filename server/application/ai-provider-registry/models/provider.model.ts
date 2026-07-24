/** Registered AI provider — generic provider metadata only, no domain knowledge. */
export interface Provider {
  readonly providerId: string;
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly configuration: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterProviderInput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly configuration?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateProviderInput {
  readonly providerId: string;
  readonly name?: string;
  readonly type?: string;
  readonly description?: string;
  readonly configuration?: string;
  readonly status?: "active" | "inactive";
}

export interface ListProvidersResult {
  readonly providers: readonly Provider[];
  readonly total: number;
}

export interface FindProviderByNameResult {
  readonly provider: Provider | null;
}

export interface ListProvidersByTypeResult {
  readonly providers: readonly Provider[];
  readonly total: number;
  readonly type: string;
}

export interface DeleteProviderResult {
  readonly providerId: string;
  readonly deleted: boolean;
}

export interface ProviderRegistryStatistics {
  readonly totalProviders: number;
  readonly activeProviders: number;
  readonly typeCount: number;
  readonly types: readonly string[];
}

export function createProvider(input: {
  providerId: string;
  name: string;
  type: string;
  description?: string;
  configuration?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Provider {
  const now = new Date().toISOString();
  return Object.freeze({
    providerId: input.providerId,
    name: input.name.trim(),
    type: input.type.trim(),
    description: (input.description ?? "").trim(),
    configuration: (input.configuration ?? "{}").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
