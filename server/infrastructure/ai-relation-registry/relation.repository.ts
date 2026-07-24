import type { IRelationRepository } from "@server/application/ai-relation-registry/contracts/relation-repository.contract";
import type { Relation } from "@server/application/ai-relation-registry/models/relation.model";

/** In-memory relation store. */
export class RelationRepository implements IRelationRepository {
  private readonly relations = new Map<string, Relation>();
  private readonly relationsByName = new Map<string, string>();
  private readonly relationsByCategory = new Map<string, Set<string>>();

  async save(relation: Relation): Promise<void> {
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

  async findAll(): Promise<readonly Relation[]> {
    return Object.freeze([...this.relations.values()]);
  }

  async delete(relationId: string): Promise<boolean> {
    const relation = await this.findById(relationId);
    if (!relation) {
      return false;
    }
    this.relations.delete(relation.relationId);
    this.relationsByName.delete(relation.name);
    this.removeFromCategory(relation.category, relation.relationId);
    return true;
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
