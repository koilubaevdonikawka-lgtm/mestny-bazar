/**
 * AI Dataset Version Registry — unified registry for AI dataset versions.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IDatasetVersionCatalog } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-catalog.contract";
import type { IDatasetVersionRepository } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-repository.contract";
import type { IDatasetVersionSerializer } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-serializer.contract";
import type { IDatasetVersionStatisticsProvider } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-statistics-provider.contract";
import type { IDatasetVersionValidator } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-validator.contract";
import {
  createDatasetVersion,
  type DeleteDatasetVersionResult,
  type FindDatasetVersionByNameResult,
  type ListDatasetVersionsByCategoryResult,
  type ListDatasetVersionsResult,
  type RegisterDatasetVersionInput,
  type DatasetVersion,
  type DatasetVersionRegistryStatistics,
  type UpdateDatasetVersionInput,
} from "@server/application/ai-dataset-version-registry/models/dataset-version.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiDatasetVersionRegistryService {
  constructor(
    private readonly datasetVersionRepository: IDatasetVersionRepository,
    private readonly datasetVersionCatalog: IDatasetVersionCatalog,
    private readonly datasetVersionValidator: IDatasetVersionValidator,
    private readonly datasetVersionSerializer: IDatasetVersionSerializer,
    private readonly statisticsProvider: IDatasetVersionStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerDatasetVersion(input: RegisterDatasetVersionInput): Promise<DatasetVersion> {
    const validation = await this.datasetVersionValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.datasetVersionRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Dataset version already exists with name: ${input.name.trim()}`);
    }

    const datasetVersion = createDatasetVersion({
      datasetVersionId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.datasetVersionRepository.save(datasetVersion);
    await this.datasetVersionCatalog.register(datasetVersion);
    return datasetVersion;
  }

  async getDatasetVersion(datasetVersionId: string): Promise<DatasetVersion | null> {
    return this.datasetVersionRepository.findById(datasetVersionId.trim());
  }

  async listDatasetVersions(): Promise<ListDatasetVersionsResult> {
    const datasetVersions = Object.freeze(
      [...(await this.datasetVersionRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ datasetVersions, total: datasetVersions.length });
  }

  async updateDatasetVersion(input: UpdateDatasetVersionInput): Promise<DatasetVersion> {
    const datasetVersionId = input.datasetVersionId.trim();
    const existing = await this.datasetVersionRepository.findById(datasetVersionId);
    if (!existing) {
      throw new Error(`Dataset version not found: ${datasetVersionId}`);
    }

    const validation = await this.datasetVersionValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.datasetVersionRepository.findByName(input.name.trim());
      if (duplicate && duplicate.datasetVersionId !== existing.datasetVersionId) {
        throw new Error(`Dataset version already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createDatasetVersion({
      datasetVersionId: existing.datasetVersionId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.datasetVersionRepository.save(updated);
    await this.datasetVersionCatalog.register(updated);
    return updated;
  }

  async deleteDatasetVersion(datasetVersionId: string): Promise<DeleteDatasetVersionResult> {
    const normalizedDatasetVersionId = datasetVersionId.trim();
    const deleted = await this.datasetVersionRepository.delete(normalizedDatasetVersionId);
    if (deleted) {
      await this.datasetVersionCatalog.remove(normalizedDatasetVersionId);
    }
    return Object.freeze({ datasetVersionId: normalizedDatasetVersionId, deleted });
  }

  async findDatasetVersionByName(name: string): Promise<FindDatasetVersionByNameResult> {
    const normalizedName = name.trim();
    const datasetVersion = await this.datasetVersionRepository.findByName(normalizedName);
    return Object.freeze({ datasetVersion });
  }

  async listDatasetVersionsByCategory(
    category: string,
  ): Promise<ListDatasetVersionsByCategoryResult> {
    const normalizedCategory = category.trim();
    const datasetVersions = Object.freeze(
      [...(await this.datasetVersionRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      datasetVersions,
      total: datasetVersions.length,
      category: normalizedCategory,
    });
  }

  async getDatasetVersionRegistryStatistics(): Promise<DatasetVersionRegistryStatistics> {
    const datasetVersions = await this.datasetVersionRepository.findAll();
    const activeDatasetVersions = datasetVersions.filter(
      (datasetVersion) => datasetVersion.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(datasetVersions.map((datasetVersion) => datasetVersion.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalDatasetVersions: datasetVersions.length,
      activeDatasetVersions,
      categories,
    });
  }

  async serializeDatasetVersion(datasetVersion: DatasetVersion): Promise<string> {
    return this.datasetVersionSerializer.serialize(datasetVersion);
  }

  async deserializeDatasetVersion(serialized: string): Promise<DatasetVersion> {
    return this.datasetVersionSerializer.deserialize(serialized);
  }
}
