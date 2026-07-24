import type { IDatasetVersionCatalog } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-catalog.contract";
import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** Default in-memory dataset version catalog index. */
export class DefaultDatasetVersionCatalog implements IDatasetVersionCatalog {
  private readonly datasetVersions = new Map<string, DatasetVersion>();
  private readonly datasetVersionsByName = new Map<string, string>();
  private readonly datasetVersionsByCategory = new Map<string, Set<string>>();

  async register(datasetVersion: DatasetVersion): Promise<void> {
    const existing = this.datasetVersions.get(datasetVersion.datasetVersionId);
    if (existing) {
      if (existing.name !== datasetVersion.name) {
        this.datasetVersionsByName.delete(existing.name);
      }
      if (existing.category !== datasetVersion.category) {
        this.removeFromCategory(existing.category, existing.datasetVersionId);
      }
    }

    this.datasetVersions.set(datasetVersion.datasetVersionId, datasetVersion);
    this.datasetVersionsByName.set(datasetVersion.name, datasetVersion.datasetVersionId);
    this.addToCategory(datasetVersion.category, datasetVersion.datasetVersionId);
  }

  async remove(datasetVersionId: string): Promise<void> {
    const datasetVersion = this.datasetVersions.get(datasetVersionId.trim());
    if (!datasetVersion) {
      return;
    }
    this.datasetVersions.delete(datasetVersion.datasetVersionId);
    this.datasetVersionsByName.delete(datasetVersion.name);
    this.removeFromCategory(datasetVersion.category, datasetVersion.datasetVersionId);
  }

  async findById(datasetVersionId: string): Promise<DatasetVersion | null> {
    return this.datasetVersions.get(datasetVersionId.trim()) ?? null;
  }

  async findByName(name: string): Promise<DatasetVersion | null> {
    const datasetVersionId = this.datasetVersionsByName.get(name.trim());
    if (!datasetVersionId) {
      return null;
    }
    return this.datasetVersions.get(datasetVersionId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly DatasetVersion[]> {
    const datasetVersionIds = this.datasetVersionsByCategory.get(category.trim());
    if (!datasetVersionIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...datasetVersionIds]
        .map((datasetVersionId) => this.datasetVersions.get(datasetVersionId))
        .filter((datasetVersion): datasetVersion is DatasetVersion => datasetVersion !== undefined),
    );
  }

  async listAll(): Promise<readonly DatasetVersion[]> {
    return Object.freeze([...this.datasetVersions.values()]);
  }

  private addToCategory(category: string, datasetVersionId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.datasetVersionsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(datasetVersionId);
    this.datasetVersionsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, datasetVersionId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.datasetVersionsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(datasetVersionId);
    if (categorySet.size === 0) {
      this.datasetVersionsByCategory.delete(normalizedCategory);
    }
  }
}
