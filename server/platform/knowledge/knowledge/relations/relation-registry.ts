import type { IRelationRegistry } from "@server/platform/knowledge/knowledge/contracts";
import {
  createKnowledgeRelation,
  type KnowledgeRelation,
  type KnowledgeRelationKind,
} from "@server/platform/knowledge/knowledge/models";
import { createKnowledgeRelationRegisteredEvent } from "@server/platform/knowledge/knowledge/events";

/** Registers typed knowledge graph relations. */
export class RelationRegistry implements IRelationRegistry {
  private readonly relations: KnowledgeRelation[] = [];

  register(relation: KnowledgeRelation): KnowledgeRelation {
    const stored = createKnowledgeRelation(relation);
    this.relations.push(stored);
    createKnowledgeRelationRegisteredEvent(stored);
    return stored;
  }

  list(kind?: KnowledgeRelationKind): readonly KnowledgeRelation[] {
    const filtered = kind
      ? this.relations.filter((relation) => relation.kind === kind)
      : this.relations;
    return Object.freeze([...filtered]);
  }

  listBySource(sourceId: string): readonly KnowledgeRelation[] {
    return Object.freeze(
      this.relations.filter((relation) => relation.sourceId === sourceId.trim()),
    );
  }

  listByTarget(targetId: string): readonly KnowledgeRelation[] {
    return Object.freeze(
      this.relations.filter((relation) => relation.targetId === targetId.trim()),
    );
  }
}
