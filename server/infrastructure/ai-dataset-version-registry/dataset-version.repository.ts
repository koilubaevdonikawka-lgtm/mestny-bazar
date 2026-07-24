import type { IDatasetVersionRepository } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-repository.contract";
import type { DatasetVersion } from "@server/application/ai-dataset-version-registry/models/dataset-version.model";

/** In-memory dataset version store. */
export class DatasetVersionRepository implements IDatasetVersionRepository {
  private readonly datasetVersions = new Map<string, DatasetVersion>();
  private readonly datasetVersionsByName = new Map<string, string>();
  private readonly datasetVersionsByCategory = new Map<string, Set<string>>();

  async save(datasetVersion: DatasetVersion): Promise<void> {
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

  async findAll(): Promise<readonly DatasetVersion[]> {
    return Object.freeze([...this.datasetVersions.values()]);
  }

  async delete(datasetVersionId: string): Promise<boolean> {
    const datasetVersion = await this.findById(datasetVersionId);
    if (!datasetVersion) {
      return false;
    }
    this.datasetVersions.delete(datasetVersion.datasetVersionId);
    this.datasetVersionsByName.delete(datasetVersion.name);
    this.removeFromCategory(datasetVersion.category, datasetVersion.datasetVersionId);
    return true;
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
