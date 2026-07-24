import type { IOntologyCatalog } from "@server/application/ai-ontology-registry/contracts/ontology-catalog.contract";
import type { Ontology } from "@server/application/ai-ontology-registry/models/ontology.model";

/** Default in-memory ontology catalog index. */
export class DefaultOntologyCatalog implements IOntologyCatalog {
  private readonly ontologies = new Map<string, Ontology>();
  private readonly ontologiesByName = new Map<string, string>();
  private readonly ontologiesByCategory = new Map<string, Set<string>>();

  async register(ontology: Ontology): Promise<void> {
    const existing = this.ontologies.get(ontology.ontologyId);
    if (existing) {
      if (existing.name !== ontology.name) {
        this.ontologiesByName.delete(existing.name);
      }
      if (existing.category !== ontology.category) {
        this.removeFromCategory(existing.category, existing.ontologyId);
      }
    }

    this.ontologies.set(ontology.ontologyId, ontology);
    this.ontologiesByName.set(ontology.name, ontology.ontologyId);
    this.addToCategory(ontology.category, ontology.ontologyId);
  }

  async remove(ontologyId: string): Promise<void> {
    const ontology = this.ontologies.get(ontologyId.trim());
    if (!ontology) {
      return;
    }
    this.ontologies.delete(ontology.ontologyId);
    this.ontologiesByName.delete(ontology.name);
    this.removeFromCategory(ontology.category, ontology.ontologyId);
  }

  async findById(ontologyId: string): Promise<Ontology | null> {
    return this.ontologies.get(ontologyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Ontology | null> {
    const ontologyId = this.ontologiesByName.get(name.trim());
    if (!ontologyId) {
      return null;
    }
    return this.ontologies.get(ontologyId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Ontology[]> {
    const ontologyIds = this.ontologiesByCategory.get(category.trim());
    if (!ontologyIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...ontologyIds]
        .map((ontologyId) => this.ontologies.get(ontologyId))
        .filter((ontology): ontology is Ontology => ontology !== undefined),
    );
  }

  async listAll(): Promise<readonly Ontology[]> {
    return Object.freeze([...this.ontologies.values()]);
  }

  private addToCategory(category: string, ontologyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.ontologiesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(ontologyId);
    this.ontologiesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, ontologyId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.ontologiesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(ontologyId);
    if (categorySet.size === 0) {
      this.ontologiesByCategory.delete(normalizedCategory);
    }
  }
}
