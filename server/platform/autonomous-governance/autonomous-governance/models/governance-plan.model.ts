export type GovernancePlanKind =
  | "governance"
  | "improvement"
  | "risk"
  | "evolution";

/** Governance action plan metadata (no execution). */
export interface GovernancePlan {
  readonly id: string;
  readonly kind: GovernancePlanKind;
  readonly title: string;
  readonly actions: readonly string[];
  readonly generatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createGovernancePlan(input: {
  id?: string;
  kind: GovernancePlanKind;
  title: string;
  actions?: readonly string[];
  metadata?: Readonly<Record<string, unknown>>;
}): GovernancePlan {
  return Object.freeze({
    id: input.id ?? `plan-${Date.now()}`,
    kind: input.kind,
    title: input.title.trim(),
    actions: Object.freeze([...(input.actions ?? [])]),
    generatedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
