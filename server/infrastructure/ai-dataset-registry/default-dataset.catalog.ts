import type { IDatasetCatalog } from "@server/application/ai-dataset-registry/contracts/dataset-catalog.contract";
import type { Dataset } from "@server/application/ai-dataset-registry/models/dataset.model";

/** Default in-memory dataset catalog index. */
export class DefaultDatasetCatalog implements IDatasetCatalog {
  private readonly datasets = new Map<string, Dataset>();
  private readonly datasetsByName = new Map<string, string>();
  private readonly datasetsByCategory = new Map<string, Set<string>>();

  async register(dataset: Dataset): Promise<void> {
    const existing = this.datasets.get(dataset.datasetId);
    if (existing) {
      if (existing.name !== dataset.name) {
        this.datasetsByName.delete(existing.name);
      }
      if (existing.category !== dataset.category) {
        this.removeFromCategory(existing.category, existing.datasetId);
      }
    }

    this.datasets.set(dataset.datasetId, dataset);
    this.datasetsByName.set(dataset.name, dataset.datasetId);
    this.addToCategory(dataset.category, dataset.datasetId);
  }

  async remove(datasetId: string): Promise<void> {
    const dataset = this.datasets.get(datasetId.trim());
    if (!dataset) {
      return;
    }
    this.datasets.delete(dataset.datasetId);
    this.datasetsByName.delete(dataset.name);
    this.removeFromCategory(dataset.category, dataset.datasetId);
  }

  async findById(datasetId: string): Promise<Dataset | null> {
    return this.datasets.get(datasetId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Dataset | null> {
    const datasetId = this.datasetsByName.get(name.trim());
    if (!datasetId) {
      return null;
    }
    return this.datasets.get(datasetId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Dataset[]> {
    const datasetIds = this.datasetsByCategory.get(category.trim());
    if (!datasetIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...datasetIds]
        .map((datasetId) => this.datasets.get(datasetId))
        .filter((dataset): dataset is Dataset => dataset !== undefined),
    );
  }

  async listAll(): Promise<readonly Dataset[]> {
    return Object.freeze([...this.datasets.values()]);
  }

  private addToCategory(category: string, datasetId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.datasetsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(datasetId);
    this.datasetsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, datasetId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.datasetsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(datasetId);
    if (categorySet.size === 0) {
      this.datasetsByCategory.delete(normalizedCategory);
    }
  }
}
