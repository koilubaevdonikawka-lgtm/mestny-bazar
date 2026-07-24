/** Registered AI schema — generic schema metadata only, no domain knowledge. */
export interface Schema {
  readonly schemaId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSchemaInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateSchemaInput {
  readonly schemaId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListSchemasResult {
  readonly schemas: readonly Schema[];
  readonly total: number;
}

export interface FindSchemaByNameResult {
  readonly schema: Schema | null;
}

export interface ListSchemasByCategoryResult {
  readonly schemas: readonly Schema[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteSchemaResult {
  readonly schemaId: string;
  readonly deleted: boolean;
}

export interface SchemaRegistryStatistics {
  readonly totalSchemas: number;
  readonly activeSchemas: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createSchema(input: {
  schemaId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Schema {
  const now = new Date().toISOString();
  return Object.freeze({
    schemaId: input.schemaId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
