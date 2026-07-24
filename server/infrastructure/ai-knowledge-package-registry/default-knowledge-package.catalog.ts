import type { IKnowledgePackageCatalog } from "@server/application/ai-knowledge-package-registry/contracts/knowledge-package-catalog.contract";
import type { KnowledgePackage } from "@server/application/ai-knowledge-package-registry/models/knowledge-package.model";

/** Default in-memory knowledge package catalog index. */
export class DefaultKnowledgePackageCatalog implements IKnowledgePackageCatalog {
  private readonly knowledgePackages = new Map<string, KnowledgePackage>();
  private readonly knowledgePackagesByName = new Map<string, string>();
  private readonly knowledgePackagesByCategory = new Map<string, Set<string>>();

  async register(knowledgePackage: KnowledgePackage): Promise<void> {
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

  async remove(knowledgePackageId: string): Promise<void> {
    const knowledgePackage = this.knowledgePackages.get(knowledgePackageId.trim());
    if (!knowledgePackage) {
      return;
    }
    this.knowledgePackages.delete(knowledgePackage.knowledgePackageId);
    this.knowledgePackagesByName.delete(knowledgePackage.name);
    this.removeFromCategory(knowledgePackage.category, knowledgePackage.knowledgePackageId);
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

  async listAll(): Promise<readonly KnowledgePackage[]> {
    return Object.freeze([...this.knowledgePackages.values()]);
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
