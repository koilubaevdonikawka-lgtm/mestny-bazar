import type { ITaxonomyCatalog } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-catalog.contract";
import type { Taxonomy } from "@server/application/ai-taxonomy-registry/models/taxonomy.model";

/** Default in-memory taxonomy catalog index. */
export class DefaultTaxonomyCatalog implements ITaxonomyCatalog {
  private readonly taxonomies = new Map<string, Taxonomy>();
  private readonly taxonomiesByName = new Map<string, string>();
  private readonly taxonomiesByCategory = new Map<string, Set<string>>();

  async register(taxonomy: Taxonomy): Promise<void> {
    const existing = this.taxonomies.get(taxonomy.taxonomyId);
    if (existing) {
      if (existing.name !== taxonomy.name) {
        this.taxonomiesByName.delete(existing.name);
      }
      if (existing.category !== taxonomy.category) {
        this.removeFromCategory(existing.category, existing.taxonomyId);
      }
    }

    this.taxonomies.set(taxonomy.taxonomyId, taxonomy);
    this.taxonomiesByName.set(taxonomy.name, taxonomy.taxonomyId);
    this.addToCategory(taxonomy.category, taxonomy.taxonomyId);
  }

  async remove(taxonomyId: string): Promise<void> {
    const taxonomy = this.taxonomies.get(taxonomyId.trim());
    if (!taxonomy) {
      return;
    }
    this.taxonomies.delete(taxonomy.taxonomyId);
    this.taxonomiesByName.delete(taxonomy.name);
    this.removeFromCategory(taxonomy.category, taxonomy.taxonomyId);
  }

  async findById(taxonomyId: string): Promise<Taxonomy | null> {
    return this.taxonomies.get(taxonomyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Taxonomy | null> {
    const taxonomyId = this.taxonomiesByName.get(name.trim());
    if (!taxonomyId) {
      return null;
    }
    return this.taxonomies.get(taxonomyId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Taxonomy[]> {
    const taxonomyIds = this.taxonomiesByCategory.get(category.trim());
    if (!taxonomyIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...taxonomyIds]
        .map((taxonomyId) => this.taxonomies.get(taxonomyId))
        .filter((taxonomy): taxonomy is Taxonomy => taxonomy !== undefined),
    );
  }

  async listAll(): Promise<readonly Taxonomy[]> {
    return Object.freeze([...this.taxonomies.values()]);
  }

  private addToCategory(category: string, taxonomyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.taxonomiesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(taxonomyId);
    this.taxonomiesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, taxonomyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.taxonomiesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(taxonomyId);
    if (categorySet.size === 0) {
      this.taxonomiesByCategory.delete(normalizedCategory);
    }
  }
}
