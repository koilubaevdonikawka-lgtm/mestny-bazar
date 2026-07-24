import type { IKnowledgeCatalog } from "@server/application/ai-knowledge-registry/contracts/knowledge-catalog.contract";
import type { KnowledgeSource } from "@server/application/ai-knowledge-registry/models/knowledge-source.model";

/** Default in-memory knowledge catalog index. */
export class DefaultKnowledgeCatalog implements IKnowledgeCatalog {
  private readonly sources = new Map<string, KnowledgeSource>();
  private readonly sourcesByName = new Map<string, string>();
  private readonly sourcesByCategory = new Map<string, Set<string>>();

  async register(source: KnowledgeSource): Promise<void> {
    const existing = this.sources.get(source.knowledgeId);
    if (existing) {
      if (existing.name !== source.name) {
        this.sourcesByName.delete(existing.name);
      }
      if (existing.category !== source.category) {
        this.removeFromCategory(existing.category, existing.knowledgeId);
      }
    }

    this.sources.set(source.knowledgeId, source);
    this.sourcesByName.set(source.name, source.knowledgeId);
    this.addToCategory(source.category, source.knowledgeId);
  }

  async remove(knowledgeId: string): Promise<void> {
    const source = this.sources.get(knowledgeId.trim());
    if (!source) {
      return;
    }
    this.sources.delete(source.knowledgeId);
    this.sourcesByName.delete(source.name);
    this.removeFromCategory(source.category, source.knowledgeId);
  }

  async findById(knowledgeId: string): Promise<KnowledgeSource | null> {
    return this.sources.get(knowledgeId.trim()) ?? null;
  }

  async findByName(name: string): Promise<KnowledgeSource | null> {
    const knowledgeId = this.sourcesByName.get(name.trim());
    if (!knowledgeId) {
      return null;
    }
    return this.findById(knowledgeId);
  }

  async findByCategory(category: string): Promise<readonly KnowledgeSource[]> {
    const knowledgeIds = this.sourcesByCategory.get(category.trim());
    if (!knowledgeIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...knowledgeIds]
        .map((knowledgeId) => this.sources.get(knowledgeId))
        .filter((source): source is KnowledgeSource => source !== undefined),
    );
  }

  async listAll(): Promise<readonly KnowledgeSource[]> {
    return Object.freeze([...this.sources.values()]);
  }

  private addToCategory(category: string, knowledgeId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.sourcesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(knowledgeId);
    this.sourcesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, knowledgeId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.sourcesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(knowledgeId);
    if (categorySet.size === 0) {
      this.sourcesByCategory.delete(normalizedCategory);
    }
  }
}
