/**
 * AI Model Registry — unified registry for AI models.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IModelCatalog } from "@server/application/ai-model-registry/contracts/model-catalog.contract";
import type { IModelRepository } from "@server/application/ai-model-registry/contracts/model-repository.contract";
import type { IModelSerializer } from "@server/application/ai-model-registry/contracts/model-serializer.contract";
import type { IModelStatisticsProvider } from "@server/application/ai-model-registry/contracts/model-statistics-provider.contract";
import type { IModelValidator } from "@server/application/ai-model-registry/contracts/model-validator.contract";
import {
  createModel,
  type DeleteModelResult,
  type FindModelByNameResult,
  type ListModelsByProviderResult,
  type ListModelsResult,
  type Model,
  type ModelRegistryStatistics,
  type RegisterModelInput,
  type UpdateModelInput,
} from "@server/application/ai-model-registry/models/model.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiModelRegistryService {
  constructor(
    private readonly modelRepository: IModelRepository,
    private readonly modelCatalog: IModelCatalog,
    private readonly modelValidator: IModelValidator,
    private readonly modelSerializer: IModelSerializer,
    private readonly statisticsProvider: IModelStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerModel(input: RegisterModelInput): Promise<Model> {
    const validation = await this.modelValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.modelRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Model already exists with name: ${input.name.trim()}`);
    }

    const model = createModel({
      modelId: this.idGenerator.generate(),
      name: input.name,
      provider: input.provider,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.modelRepository.save(model);
    await this.modelCatalog.register(model);
    return model;
  }

  async getModel(modelId: string): Promise<Model | null> {
    return this.modelRepository.findById(modelId.trim());
  }

  async listModels(): Promise<ListModelsResult> {
    const models = Object.freeze(
      [...(await this.modelRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ models, total: models.length });
  }

  async updateModel(input: UpdateModelInput): Promise<Model> {
    const modelId = input.modelId.trim();
    const existing = await this.modelRepository.findById(modelId);
    if (!existing) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const validation = await this.modelValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.modelRepository.findByName(input.name.trim());
      if (duplicate && duplicate.modelId !== existing.modelId) {
        throw new Error(`Model already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createModel({
      modelId: existing.modelId,
      name: input.name?.trim() ?? existing.name,
      provider: input.provider?.trim() ?? existing.provider,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.modelRepository.save(updated);
    await this.modelCatalog.register(updated);
    return updated;
  }

  async deleteModel(modelId: string): Promise<DeleteModelResult> {
    const normalizedModelId = modelId.trim();
    const deleted = await this.modelRepository.delete(normalizedModelId);
    if (deleted) {
      await this.modelCatalog.remove(normalizedModelId);
    }
    return Object.freeze({ modelId: normalizedModelId, deleted });
  }

  async findModelByName(name: string): Promise<FindModelByNameResult> {
    const normalizedName = name.trim();
    const model = await this.modelRepository.findByName(normalizedName);
    return Object.freeze({ model });
  }

  async listModelsByProvider(provider: string): Promise<ListModelsByProviderResult> {
    const normalizedProvider = provider.trim();
    const models = Object.freeze(
      [...(await this.modelRepository.findByProvider(normalizedProvider))].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      models,
      total: models.length,
      provider: normalizedProvider,
    });
  }

  async getModelRegistryStatistics(): Promise<ModelRegistryStatistics> {
    const models = await this.modelRepository.findAll();
    const activeModels = models.filter((model) => model.status === "active").length;
    const providers = Object.freeze([
      ...new Set(models.map((model) => model.provider)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalModels: models.length,
      activeModels,
      providers,
    });
  }

  async serializeModel(model: Model): Promise<string> {
    return this.modelSerializer.serialize(model);
  }

  async deserializeModel(serialized: string): Promise<Model> {
    return this.modelSerializer.deserialize(serialized);
  }
}
