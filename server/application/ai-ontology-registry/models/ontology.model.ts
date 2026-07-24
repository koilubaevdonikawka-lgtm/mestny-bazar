/** Registered AI ontology — generic ontology metadata only, no domain knowledge. */
export interface Ontology {
  readonly ontologyId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterOntologyInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateOntologyInput {
  readonly ontologyId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListOntologiesResult {
  readonly ontologies: readonly Ontology[];
  readonly total: number;
}

export interface FindOntologyByNameResult {
  readonly ontology: Ontology | null;
}

export interface ListOntologiesByCategoryResult {
  readonly ontologies: readonly Ontology[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteOntologyResult {
  readonly ontologyId: string;
  readonly deleted: boolean;
}

export interface OntologyRegistryStatistics {
  readonly totalOntologies: number;
  readonly activeOntologies: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createOntology(input: {
  ontologyId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Ontology {
  const now = new Date().toISOString();
  return Object.freeze({
    ontologyId: input.ontologyId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
