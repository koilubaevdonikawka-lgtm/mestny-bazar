import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

/** Future integration point for relation import. Not wired yet. */
export interface IRelationImportProvider {
  importFrom(source: string): Promise<readonly Relation[]>;
}
