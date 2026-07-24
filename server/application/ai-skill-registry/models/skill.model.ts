/** Registered AI skill — generic skill metadata only, no domain knowledge. */
export interface Skill {
  readonly skillId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterSkillInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateSkillInput {
  readonly skillId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListSkillsResult {
  readonly skills: readonly Skill[];
  readonly total: number;
}

export interface FindSkillByNameResult {
  readonly skill: Skill | null;
}

export interface ListSkillsByCategoryResult {
  readonly skills: readonly Skill[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteSkillResult {
  readonly skillId: string;
  readonly deleted: boolean;
}

export interface SkillRegistryStatistics {
  readonly totalSkills: number;
  readonly activeSkills: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createSkill(input: {
  skillId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): Skill {
  const now = new Date().toISOString();
  return Object.freeze({
    skillId: input.skillId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
