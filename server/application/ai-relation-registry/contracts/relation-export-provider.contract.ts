import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

/** Future integration point for relation export. Not wired yet. */
export interface IRelationExportProvider {
  exportTo(relations: readonly Relation[]): Promise<string>;
}
