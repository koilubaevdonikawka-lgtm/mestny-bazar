import type { IKnowledgePackageRepository } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-repository.contract";
import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** In-memory knowledge package store. */
export class KnowledgePackageRepository implements IKnowledgePackageRepository {
  private readonly knowledgePackages = new Map<string, KnowledgePackage>();
  private readonly knowledgePackagesByName = new Map<string, string>();
  private readonly knowledgePackagesByCategory = new Map<string, Set<string>>();

  async save(knowledgePackage: KnowledgePackage): Promise<void> {
    const existing = this.knowledgePackages.get(knowledgePackage.knowledgePackageId);
    if (existing) {
      if (existing.name !== knowledgePackage.name) {
        this.knowledgePackagesByName.delete(existing.name);
      }
      if (existing.category !== knowledgePackage.category) {
        this.removeFromCategory(existing.category, existing.knowledgePackageId);
      }
    }

    this.knowledgePackages.set(knowledgePackage.knowledgePackageId, knowledgePackage);
    this.knowledgePackagesByName.set(knowledgePackage.name, knowledgePackage.knowledgePackageId);
    this.addToCategory(knowledgePackage.category, knowledgePackage.knowledgePackageId);
  }

  async findById(knowledgePackageId: string): Promise<KnowledgePackage | null> {
    return this.knowledgePackages.get(knowledgePackageId.trim()) ?? null;
  }

  async findByName(name: string): Promise<KnowledgePackage | null> {
    const knowledgePackageId = this.knowledgePackagesByName.get(name.trim());
    if (!knowledgePackageId) {
      return null;
    }
    return this.knowledgePackages.get(knowledgePackageId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly KnowledgePackage[]> {
    const knowledgePackageIds = this.knowledgePackagesByCategory.get(category.trim());
    if (!knowledgePackageIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...knowledgePackageIds]
        .map((knowledgePackageId) => this.knowledgePackages.get(knowledgePackageId))
        .filter((knowledgePackage): knowledgePackage is KnowledgePackage => knowledgePackage !== undefined),
    );
  }

  async findAll(): Promise<readonly KnowledgePackage[]> {
    return Object.freeze([...this.knowledgePackages.values()]);
  }

  async delete(knowledgePackageId: string): Promise<boolean> {
    const knowledgePackage = await this.findById(knowledgePackageId);
    if (!knowledgePackage) {
      return false;
    }
    this.knowledgePackages.delete(knowledgePackage.knowledgePackageId);
    this.knowledgePackagesByName.delete(knowledgePackage.name);
    this.removeFromCategory(knowledgePackage.category, knowledgePackage.knowledgePackageId);
    return true;
  }

  private addToCategory(category: string, knowledgePackageId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.knowledgePackagesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(knowledgePackageId);
    this.knowledgePackagesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, knowledgePackageId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.knowledgePackagesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(knowledgePackageId);
    if (categorySet.size === 0) {
      this.knowledgePackagesByCategory.delete(normalizedCategory);
    }
  }
}
