/**
 * AI Dataset Registry — unified registry for AI datasets.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IDatasetCatalog } from "@server/application/ai-dataset-registry/contracts/dataset-catalog.contract";
import type { IDatasetRepository } from "@server/application/ai-dataset-registry/contracts/dataset-repository.contract";
import type { IDatasetSerializer } from "@server/application/ai-dataset-registry/contracts/dataset-serializer.contract";
import type { IDatasetStatisticsProvider } from "@server/application/ai-dataset-registry/contracts/dataset-statistics-provider.contract";
import type { IDatasetValidator } from "@server/application/ai-dataset-registry/contracts/dataset-validator.contract";
import {
  createDataset,
  type DeleteDatasetResult,
  type FindDatasetByNameResult,
  type ListDatasetsByCategoryResult,
  type ListDatasetsResult,
  type RegisterDatasetInput,
  type Dataset,
  type DatasetRegistryStatistics,
  type UpdateDatasetInput,
} from "@server/application/ai-dataset-registry/models/dataset.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiDatasetRegistryService {
  constructor(
    private readonly datasetRepository: IDatasetRepository,
    private readonly datasetCatalog: IDatasetCatalog,
    private readonly datasetValidator: IDatasetValidator,
    private readonly datasetSerializer: IDatasetSerializer,
    private readonly statisticsProvider: IDatasetStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerDataset(input: RegisterDatasetInput): Promise<Dataset> {
    const validation = await this.datasetValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.datasetRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Dataset already exists with name: ${input.name.trim()}`);
    }

    const dataset = createDataset({
      datasetId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.datasetRepository.save(dataset);
    await this.datasetCatalog.register(dataset);
    return dataset;
  }

  async getDataset(datasetId: string): Promise<Dataset | null> {
    return this.datasetRepository.findById(datasetId.trim());
  }

  async listDatasets(): Promise<ListDatasetsResult> {
    const datasets = Object.freeze(
      [...(await this.datasetRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ datasets, total: datasets.length });
  }

  async updateDataset(input: UpdateDatasetInput): Promise<Dataset> {
    const datasetId = input.datasetId.trim();
    const existing = await this.datasetRepository.findById(datasetId);
    if (!existing) {
      throw new Error(`Dataset not found: ${datasetId}`);
    }

    const validation = await this.datasetValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.datasetRepository.findByName(input.name.trim());
      if (duplicate && duplicate.datasetId !== existing.datasetId) {
        throw new Error(`Dataset already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createDataset({
      datasetId: existing.datasetId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.datasetRepository.save(updated);
    await this.datasetCatalog.register(updated);
    return updated;
  }

  async deleteDataset(datasetId: string): Promise<DeleteDatasetResult> {
    const normalizedDatasetId = datasetId.trim();
    const deleted = await this.datasetRepository.delete(normalizedDatasetId);
    if (deleted) {
      await this.datasetCatalog.remove(normalizedDatasetId);
    }
    return Object.freeze({ datasetId: normalizedDatasetId, deleted });
  }

  async findDatasetByName(name: string): Promise<FindDatasetByNameResult> {
    const normalizedName = name.trim();
    const dataset = await this.datasetRepository.findByName(normalizedName);
    return Object.freeze({ dataset });
  }

  async listDatasetsByCategory(category: string): Promise<ListDatasetsByCategoryResult> {
    const normalizedCategory = category.trim();
    const datasets = Object.freeze(
      [...(await this.datasetRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      datasets,
      total: datasets.length,
      category: normalizedCategory,
    });
  }

  async getDatasetRegistryStatistics(): Promise<DatasetRegistryStatistics> {
    const datasets = await this.datasetRepository.findAll();
    const activeDatasets = datasets.filter((dataset) => dataset.status === "active").length;
    const categories = Object.freeze([
      ...new Set(datasets.map((dataset) => dataset.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalDatasets: datasets.length,
      activeDatasets,
      categories,
    });
  }

  async serializeDataset(dataset: Dataset): Promise<string> {
    return this.datasetSerializer.serialize(dataset);
  }

  async deserializeDataset(serialized: string): Promise<Dataset> {
    return this.datasetSerializer.deserialize(serialized);
  }
}
