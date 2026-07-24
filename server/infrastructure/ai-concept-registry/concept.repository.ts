import type { IConceptRepository } from "@server/application/ai-concept-registry/contracts/concept-repository.contract";
import type { Concept } from "@server/application/ai-concept-registry/models/concept.model";

/** In-memory concept store. */
export class ConceptRepository implements IConceptRepository {
  private readonly concepts = new Map<string, Concept>();
  private readonly conceptsByName = new Map<string, string>();
  private readonly conceptsByCategory = new Map<string, Set<string>>();

  async save(concept: Concept): Promise<void> {
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

  async findAll(): Promise<readonly Concept[]> {
    return Object.freeze([...this.concepts.values()]);
  }

  async delete(conceptId: string): Promise<boolean> {
    const concept = await this.findById(conceptId);
    if (!concept) {
      return false;
    }
    this.concepts.delete(concept.conceptId);
    this.conceptsByName.delete(concept.name);
    this.removeFromCategory(concept.category, concept.conceptId);
    return true;
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
