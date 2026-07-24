import type { IConceptCatalog } from "@server/application/ai-concept-registry/contracts/concept-catalog.contract";
import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

/** Default in-memory concept catalog index. */
export class DefaultConceptCatalog implements IConceptCatalog {
  private readonly concepts = new Map<string, Concept>();
  private readonly conceptsByName = new Map<string, string>();
  private readonly conceptsByCategory = new Map<string, Set<string>>();

  async register(concept: Concept): Promise<void> {
    const existing = this.concepts.get(concept.conceptId);
    if (existing) {
      if (existing.name !== concept.name) {
        this.conceptsByName.delete(existing.name);
      }
      if (existing.category !== concept.category) {
        this.removeFromCategory(existing.category, existing.conceptId);
      }
    }

    this.concepts.set(concept.conceptId, concept);
    this.conceptsByName.set(concept.name, concept.conceptId);
    this.addToCategory(concept.category, concept.conceptId);
  }

  async remove(conceptId: string): Promise<void> {
    const concept = this.concepts.get(conceptId.trim());
    if (!concept) {
      return;
    }
    this.concepts.delete(concept.conceptId);
    this.conceptsByName.delete(concept.name);
    this.removeFromCategory(concept.category, concept.conceptId);
  }

  async findById(conceptId: string): Promise<Concept | null> {
    return this.concepts.get(conceptId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Concept | null> {
    const conceptId = this.conceptsByName.get(name.trim());
    if (!conceptId) {
      return null;
    }
    return this.concepts.get(conceptId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Concept[]> {
    const conceptIds = this.conceptsByCategory.get(category.trim());
    if (!conceptIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...conceptIds]
        .map((conceptId) => this.concepts.get(conceptId))
        .filter((concept): concept is Concept => concept !== undefined),
    );
  }

  async listAll(): Promise<readonly Concept[]> {
    return Object.freeze([...this.concepts.values()]);
  }

  private addToCategory(category: string, conceptId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.conceptsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(conceptId);
    this.conceptsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, conceptId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.conceptsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(conceptId);
    if (categorySet.size === 0) {
      this.conceptsByCategory.delete(normalizedCategory);
    }
  }
}
