import type { IKnowledgeSourceRepository } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-repository.contract";
import type { KnowledgeSource } from "@server/application/ai-knowledge-source-registry/models/knowledge-source.model";

/** In-memory knowledge source store. */
export class KnowledgeSourceRepository implements IKnowledgeSourceRepository {
  private readonly knowledgeSources = new Map<string, KnowledgeSource>();
  private readonly knowledgeSourcesByName = new Map<string, string>();
  private readonly knowledgeSourcesByCategory = new Map<string, Set<string>>();

  async save(knowledgeSource: KnowledgeSource): Promise<void> {
    const existing = this.knowledgeSources.get(knowledgeSource.knowledgeSourceId);
    if (existing) {
      if (existing.name !== knowledgeSource.name) {
        this.knowledgeSourcesByName.delete(existing.name);
      }
      if (existing.category !== knowledgeSource.category) {
        this.removeFromCategory(existing.category, existing.knowledgeSourceId);
      }
    }

    this.knowledgeSources.set(knowledgeSource.knowledgeSourceId, knowledgeSource);
    this.knowledgeSourcesByName.set(knowledgeSource.name, knowledgeSource.knowledgeSourceId);
    this.addToCategory(knowledgeSource.category, knowledgeSource.knowledgeSourceId);
  }

  async findById(knowledgeSourceId: string): Promise<KnowledgeSource | null> {
    return this.knowledgeSources.get(knowledgeSourceId.trim()) ?? null;
  }

  async findByName(name: string): Promise<KnowledgeSource | null> {
    const knowledgeSourceId = this.knowledgeSourcesByName.get(name.trim());
    if (!knowledgeSourceId) {
      return null;
    }
    return this.knowledgeSources.get(knowledgeSourceId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly KnowledgeSource[]> {
    const knowledgeSourceIds = this.knowledgeSourcesByCategory.get(category.trim());
    if (!knowledgeSourceIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...knowledgeSourceIds]
        .map((knowledgeSourceId) => this.knowledgeSources.get(knowledgeSourceId))
        .filter((knowledgeSource): knowledgeSource is KnowledgeSource => knowledgeSource !== undefined),
    );
  }

  async findAll(): Promise<readonly KnowledgeSource[]> {
    return Object.freeze([...this.knowledgeSources.values()]);
  }

  async delete(knowledgeSourceId: string): Promise<boolean> {
    const knowledgeSource = await this.findById(knowledgeSourceId);
    if (!knowledgeSource) {
      return false;
    }
    this.knowledgeSources.delete(knowledgeSource.knowledgeSourceId);
    this.knowledgeSourcesByName.delete(knowledgeSource.name);
    this.removeFromCategory(knowledgeSource.category, knowledgeSource.knowledgeSourceId);
    return true;
  }

  private addToCategory(category: string, knowledgeSourceId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.knowledgeSourcesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(knowledgeSourceId);
    this.knowledgeSourcesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, knowledgeSourceId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.knowledgeSourcesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(knowledgeSourceId);
    if (categorySet.size === 0) {
      this.knowledgeSourcesByCategory.delete(normalizedCategory);
    }
  }
}
