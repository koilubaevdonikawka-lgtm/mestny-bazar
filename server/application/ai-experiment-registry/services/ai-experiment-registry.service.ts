/**
 * AI Experiment Registry — unified registry for AI experiments.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IExperimentCatalog } from "@server/application/ai-experiment-registry/contracts/experiment-catalog.contract";
import type { IExperimentRepository } from "@server/application/ai-experiment-registry/contracts/experiment-repository.contract";
import type { IExperimentSerializer } from "@server/application/ai-experiment-registry/contracts/experiment-serializer.contract";
import type { IExperimentStatisticsProvider } from "@server/application/ai-experiment-registry/contracts/experiment-statistics-provider.contract";
import type { IExperimentValidator } from "@server/application/ai-experiment-registry/contracts/experiment-validator.contract";
import {
  createExperiment,
  type DeleteExperimentResult,
  type FindExperimentByNameResult,
  type ListExperimentsByCategoryResult,
  type ListExperimentsResult,
  type RegisterExperimentInput,
  type Experiment,
  type ExperimentRegistryStatistics,
  type UpdateExperimentInput,
} from "@server/application/ai-experiment-registry/models/experiment.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiExperimentRegistryService {
  constructor(
    private readonly experimentRepository: IExperimentRepository,
    private readonly experimentCatalog: IExperimentCatalog,
    private readonly experimentValidator: IExperimentValidator,
    private readonly experimentSerializer: IExperimentSerializer,
    private readonly statisticsProvider: IExperimentStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerExperiment(input: RegisterExperimentInput): Promise<Experiment> {
    const validation = await this.experimentValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.experimentRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Experiment already exists with name: ${input.name.trim()}`);
    }

    const experiment = createExperiment({
      experimentId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.experimentRepository.save(experiment);
    await this.experimentCatalog.register(experiment);
    return experiment;
  }

  async getExperiment(experimentId: string): Promise<Experiment | null> {
    return this.experimentRepository.findById(experimentId.trim());
  }

  async listExperiments(): Promise<ListExperimentsResult> {
    const experiments = Object.freeze(
      [...(await this.experimentRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ experiments, total: experiments.length });
  }

  async updateExperiment(input: UpdateExperimentInput): Promise<Experiment> {
    const experimentId = input.experimentId.trim();
    const existing = await this.experimentRepository.findById(experimentId);
    if (!existing) {
      throw new Error(`Experiment not found: ${experimentId}`);
    }

    const validation = await this.experimentValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.experimentRepository.findByName(input.name.trim());
      if (duplicate && duplicate.experimentId !== existing.experimentId) {
        throw new Error(`Experiment already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createExperiment({
      experimentId: existing.experimentId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.experimentRepository.save(updated);
    await this.experimentCatalog.register(updated);
    return updated;
  }

  async deleteExperiment(experimentId: string): Promise<DeleteExperimentResult> {
    const normalizedExperimentId = experimentId.trim();
    const deleted = await this.experimentRepository.delete(normalizedExperimentId);
    if (deleted) {
      await this.experimentCatalog.remove(normalizedExperimentId);
    }
    return Object.freeze({ experimentId: normalizedExperimentId, deleted });
  }

  async findExperimentByName(name: string): Promise<FindExperimentByNameResult> {
    const normalizedName = name.trim();
    const experiment = await this.experimentRepository.findByName(normalizedName);
    return Object.freeze({ experiment });
  }

  async listExperimentsByCategory(category: string): Promise<ListExperimentsByCategoryResult> {
    const normalizedCategory = category.trim();
    const experiments = Object.freeze(
      [...(await this.experimentRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      experiments,
      total: experiments.length,
      category: normalizedCategory,
    });
  }

  async getExperimentRegistryStatistics(): Promise<ExperimentRegistryStatistics> {
    const experiments = await this.experimentRepository.findAll();
    const activeExperiments = experiments.filter(
      (experiment) => experiment.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(experiments.map((experiment) => experiment.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalExperiments: experiments.length,
      activeExperiments,
      categories,
    });
  }

  async serializeExperiment(experiment: Experiment): Promise<string> {
    return this.experimentSerializer.serialize(experiment);
  }

  async deserializeExperiment(serialized: string): Promise<Experiment> {
    return this.experimentSerializer.deserialize(serialized);
  }
}
