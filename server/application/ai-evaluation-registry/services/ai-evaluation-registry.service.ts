/**
 * AI Evaluation Registry — unified registry for AI evaluations.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IEvaluationCatalog } from "@server/application/ai-evaluation-registry/contracts/evaluation-catalog.contract";
import type { IEvaluationRepository } from "@server/application/ai-evaluation-registry/contracts/evaluation-repository.contract";
import type { IEvaluationSerializer } from "@server/application/ai-evaluation-registry/contracts/evaluation-serializer.contract";
import type { IEvaluationStatisticsProvider } from "@server/application/ai-evaluation-registry/contracts/evaluation-statistics-provider.contract";
import type { IEvaluationValidator } from "@server/application/ai-evaluation-registry/contracts/evaluation-validator.contract";
import {
  createEvaluation,
  type DeleteEvaluationResult,
  type FindEvaluationByNameResult,
  type ListEvaluationsByCategoryResult,
  type ListEvaluationsResult,
  type RegisterEvaluationInput,
  type Evaluation,
  type EvaluationRegistryStatistics,
  type UpdateEvaluationInput,
} from "@server/application/ai-evaluation-registry/models/evaluation.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiEvaluationRegistryService {
  constructor(
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly evaluationCatalog: IEvaluationCatalog,
    private readonly evaluationValidator: IEvaluationValidator,
    private readonly evaluationSerializer: IEvaluationSerializer,
    private readonly statisticsProvider: IEvaluationStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerEvaluation(input: RegisterEvaluationInput): Promise<Evaluation> {
    const validation = await this.evaluationValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.evaluationRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Evaluation already exists with name: ${input.name.trim()}`);
    }

    const evaluation = createEvaluation({
      evaluationId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.evaluationRepository.save(evaluation);
    await this.evaluationCatalog.register(evaluation);
    return evaluation;
  }

  async getEvaluation(evaluationId: string): Promise<Evaluation | null> {
    return this.evaluationRepository.findById(evaluationId.trim());
  }

  async listEvaluations(): Promise<ListEvaluationsResult> {
    const evaluations = Object.freeze(
      [...(await this.evaluationRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ evaluations, total: evaluations.length });
  }

  async updateEvaluation(input: UpdateEvaluationInput): Promise<Evaluation> {
    const evaluationId = input.evaluationId.trim();
    const existing = await this.evaluationRepository.findById(evaluationId);
    if (!existing) {
      throw new Error(`Evaluation not found: ${evaluationId}`);
    }

    const validation = await this.evaluationValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.evaluationRepository.findByName(input.name.trim());
      if (duplicate && duplicate.evaluationId !== existing.evaluationId) {
        throw new Error(`Evaluation already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createEvaluation({
      evaluationId: existing.evaluationId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.evaluationRepository.save(updated);
    await this.evaluationCatalog.register(updated);
    return updated;
  }

  async deleteEvaluation(evaluationId: string): Promise<DeleteEvaluationResult> {
    const normalizedEvaluationId = evaluationId.trim();
    const deleted = await this.evaluationRepository.delete(normalizedEvaluationId);
    if (deleted) {
      await this.evaluationCatalog.remove(normalizedEvaluationId);
    }
    return Object.freeze({ evaluationId: normalizedEvaluationId, deleted });
  }

  async findEvaluationByName(name: string): Promise<FindEvaluationByNameResult> {
    const normalizedName = name.trim();
    const evaluation = await this.evaluationRepository.findByName(normalizedName);
    return Object.freeze({ evaluation });
  }

  async listEvaluationsByCategory(category: string): Promise<ListEvaluationsByCategoryResult> {
    const normalizedCategory = category.trim();
    const evaluations = Object.freeze(
      [...(await this.evaluationRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      evaluations,
      total: evaluations.length,
      category: normalizedCategory,
    });
  }

  async getEvaluationRegistryStatistics(): Promise<EvaluationRegistryStatistics> {
    const evaluations = await this.evaluationRepository.findAll();
    const activeEvaluations = evaluations.filter(
      (evaluation) => evaluation.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(evaluations.map((evaluation) => evaluation.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalEvaluations: evaluations.length,
      activeEvaluations,
      categories,
    });
  }

  async serializeEvaluation(evaluation: Evaluation): Promise<string> {
    return this.evaluationSerializer.serialize(evaluation);
  }

  async deserializeEvaluation(serialized: string): Promise<Evaluation> {
    return this.evaluationSerializer.deserialize(serialized);
  }
}
