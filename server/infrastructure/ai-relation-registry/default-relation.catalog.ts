import type { IRelationCatalog } from "@server/application/ai-relation-registry/contracts/relation-catalog.contract";
import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

/** Default in-memory relation catalog index. */
export class DefaultRelationCatalog implements IRelationCatalog {
  private readonly relations = new Map<string, Relation>();
  private readonly relationsByName = new Map<string, string>();
  private readonly relationsByCategory = new Map<string, Set<string>>();

  async register(relation: Relation): Promise<void> {
    const existing = this.relations.get(relation.relationId);
    if (existing) {
      if (existing.name !== relation.name) {
        this.relationsByName.delete(existing.name);
      }
      if (existing.category !== relation.category) {
        this.removeFromCategory(existing.category, existing.relationId);
      }
    }

    this.relations.set(relation.relationId, relation);
    this.relationsByName.set(relation.name, relation.relationId);
    this.addToCategory(relation.category, relation.relationId);
  }

  async remove(relationId: string): Promise<void> {
    const relation = this.relations.get(relationId.trim());
    if (!relation) {
      return;
    }
    this.relations.delete(relation.relationId);
    this.relationsByName.delete(relation.name);
    this.removeFromCategory(relation.category, relation.relationId);
  }

  async findById(relationId: string): Promise<Relation | null> {
    return this.relations.get(relationId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Relation | null> {
    const relationId = this.relationsByName.get(name.trim());
    if (!relationId) {
      return null;
    }
    return this.relations.get(relationId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Relation[]> {
    const relationIds = this.relationsByCategory.get(category.trim());
    if (!relationIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...relationIds]
        .map((relationId) => this.relations.get(relationId))
        .filter((relation): relation is Relation => relation !== undefined),
    );
  }

  async listAll(): Promise<readonly Relation[]> {
    return Object.freeze([...this.relations.values()]);
  }

  private addToCategory(category: string, relationId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.relationsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(relationId);
    this.relationsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, relationId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.relationsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(relationId);
    if (categorySet.size === 0) {
      this.relationsByCategory.delete(normalizedCategory);
    }
  }
}
