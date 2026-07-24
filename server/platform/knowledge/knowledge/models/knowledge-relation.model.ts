export type KnowledgeRelationKind =
  | "depends-on"
  | "implements"
  | "uses"
  | "provides"
  | "owns"
  | "communicates-with"
  | "compatible-with";

/** Knowledge graph relation metadata. */
export interface KnowledgeRelation {
  readonly id: string;
  readonly kind: KnowledgeRelationKind;
  readonly sourceId: string;
  readonly targetId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly registeredAt: string;
}

export function createKnowledgeRelation(input: {
  id?: string;
  kind: KnowledgeRelationKind;
  sourceId: string;
  targetId: string;
  metadata?: Readonly<Record<string, unknown>>;
}): KnowledgeRelation {
  return Object.freeze({
    id: input.id ?? `relation-${Date.now()}`,
    kind: input.kind,
    sourceId: input.sourceId.trim(),
    targetId: input.targetId.trim(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    registeredAt: new Date().toISOString(),
  });
}
