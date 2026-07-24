import type { KnowledgeNode } from "./knowledge-node.model";
import type { KnowledgeRelation } from "./knowledge-relation.model";

/** Complete knowledge graph snapshot metadata. */
export interface KnowledgeGraph {
  readonly id: string;
  readonly generatedAt: string;
  readonly nodes: readonly KnowledgeNode[];
  readonly relations: readonly KnowledgeRelation[];
  readonly nodeCount: number;
  readonly relationCount: number;
}

export function createKnowledgeGraph(input: {
  id?: string;
  nodes: readonly KnowledgeNode[];
  relations: readonly KnowledgeRelation[];
}): KnowledgeGraph {
  return Object.freeze({
    id: input.id ?? `graph-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    nodes: Object.freeze([...input.nodes]),
    relations: Object.freeze([...input.relations]),
    nodeCount: input.nodes.length,
    relationCount: input.relations.length,
  });
}

export type KnowledgeQueryKind =
  | "node"
  | "relations"
  | "dependencies"
  | "providers"
  | "capabilities";

/** Knowledge query metadata. */
export interface KnowledgeQuery {
  readonly id: string;
  readonly kind: KnowledgeQueryKind;
  readonly targetId?: string;
  readonly relationKind?: KnowledgeRelation["kind"];
  readonly executedAt: string;
}

export function createKnowledgeQuery(input: {
  id?: string;
  kind: KnowledgeQueryKind;
  targetId?: string;
  relationKind?: KnowledgeRelation["kind"];
}): KnowledgeQuery {
  return Object.freeze({
    id: input.id ?? `query-${Date.now()}`,
    kind: input.kind,
    targetId: input.targetId?.trim(),
    relationKind: input.relationKind,
    executedAt: new Date().toISOString(),
  });
}

/** Knowledge query result metadata. */
export interface KnowledgeResult {
  readonly query: KnowledgeQuery;
  readonly nodes: readonly KnowledgeNode[];
  readonly relations: readonly KnowledgeRelation[];
}

export function createKnowledgeResult(input: {
  query: KnowledgeQuery;
  nodes?: readonly KnowledgeNode[];
  relations?: readonly KnowledgeRelation[];
}): KnowledgeResult {
  return Object.freeze({
    query: input.query,
    nodes: Object.freeze([...(input.nodes ?? [])]),
    relations: Object.freeze([...(input.relations ?? [])]),
  });
}
