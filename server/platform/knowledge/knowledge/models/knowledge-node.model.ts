export type KnowledgeNodeKind =
  | "platform"
  | "module"
  | "provider"
  | "sdk"
  | "gateway";

/** Knowledge graph node metadata. */
export interface KnowledgeNode {
  readonly id: string;
  readonly name: string;
  readonly kind: KnowledgeNodeKind;
  readonly description: string;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly registeredAt: string;
}

export function createKnowledgeNode(input: {
  id?: string;
  name: string;
  kind: KnowledgeNodeKind;
  description?: string;
  metadata?: Readonly<Record<string, unknown>>;
}): KnowledgeNode {
  return Object.freeze({
    id: input.id ?? `node-${Date.now()}`,
    name: input.name.trim(),
    kind: input.kind,
    description: input.description?.trim() ?? "",
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    registeredAt: new Date().toISOString(),
  });
}
