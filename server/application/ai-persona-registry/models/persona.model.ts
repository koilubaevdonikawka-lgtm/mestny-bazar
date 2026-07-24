/** Registered AI persona — generic persona metadata only, no domain knowledge. */
export interface Persona {
  readonly personaId: string;
  readonly name: string;
  readonly type: string;
  readonly description: string;
  readonly configuration: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterPersonaInput {
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly configuration?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdatePersonaInput {
  readonly personaId: string;
  readonly name?: string;
  readonly type?: string;
  readonly description?: string;
  readonly configuration?: string;
  readonly status?: "active" | "inactive";
}

export interface ListPersonasResult {
  readonly personas: readonly Persona[];
  readonly total: number;
}

export interface FindPersonaByNameResult {
  readonly persona: Persona | null;
}

export interface ListPersonasByTypeResult {
  readonly personas: readonly Persona[];
  readonly total: number;
  readonly type: string;
}

export interface DeletePersonaResult {
  readonly personaId: string;
  readonly deleted: boolean;
}

export interface PersonaRegistryStatistics {
  readonly totalPersonas: number;
  readonly activePersonas: number;
  readonly typeCount: number;
  readonly types: readonly string[];
}

export function createPersona(input: {
  personaId: string;
  name: string;
  type: string;
  description?: string;
  configuration?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Persona {
  const now = new Date().toISOString();
  return Object.freeze({
    personaId: input.personaId,
    name: input.name.trim(),
    type: input.type.trim(),
    description: (input.description ?? "").trim(),
    configuration: (input.configuration ?? "{}").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
