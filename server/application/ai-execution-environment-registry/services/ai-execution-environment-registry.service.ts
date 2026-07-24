/**
 * AI Execution Environment Registry — unified registry for AI execution environments.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IExecutionEnvironmentCatalog } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-catalog.contract";
import type { IExecutionEnvironmentRepository } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-repository.contract";
import type { IExecutionEnvironmentSerializer } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-serializer.contract";
import type { IExecutionEnvironmentStatisticsProvider } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-statistics-provider.contract";
import type { IExecutionEnvironmentValidator } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-validator.contract";
import {
  createExecutionEnvironment,
  type DeleteExecutionEnvironmentResult,
  type ExecutionEnvironment,
  type ExecutionEnvironmentRegistryStatistics,
  type FindExecutionEnvironmentByNameResult,
  type ListExecutionEnvironmentsByCategoryResult,
  type ListExecutionEnvironmentsResult,
  type RegisterExecutionEnvironmentInput,
  type UpdateExecutionEnvironmentInput,
} from "@server/application/ai-execution-environment-registry/models/execution-environment.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiExecutionEnvironmentRegistryService {
  constructor(
    private readonly executionEnvironmentRepository: IExecutionEnvironmentRepository,
    private readonly executionEnvironmentCatalog: IExecutionEnvironmentCatalog,
    private readonly executionEnvironmentValidator: IExecutionEnvironmentValidator,
    private readonly executionEnvironmentSerializer: IExecutionEnvironmentSerializer,
    private readonly statisticsProvider: IExecutionEnvironmentStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerExecutionEnvironment(
    input: RegisterExecutionEnvironmentInput,
  ): Promise<ExecutionEnvironment> {
    const validation = await this.executionEnvironmentValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.executionEnvironmentRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Execution environment already exists with name: ${input.name.trim()}`);
    }

    const executionEnvironment = createExecutionEnvironment({
      executionEnvironmentId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.executionEnvironmentRepository.save(executionEnvironment);
    await this.executionEnvironmentCatalog.register(executionEnvironment);
    return executionEnvironment;
  }

  async getExecutionEnvironment(executionEnvironmentId: string): Promise<ExecutionEnvironment | null> {
    return this.executionEnvironmentRepository.findById(executionEnvironmentId.trim());
  }

  async listExecutionEnvironments(): Promise<ListExecutionEnvironmentsResult> {
    const executionEnvironments = Object.freeze(
      [...(await this.executionEnvironmentRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ executionEnvironments, total: executionEnvironments.length });
  }

  async updateExecutionEnvironment(
    input: UpdateExecutionEnvironmentInput,
  ): Promise<ExecutionEnvironment> {
    const executionEnvironmentId = input.executionEnvironmentId.trim();
    const existing = await this.executionEnvironmentRepository.findById(executionEnvironmentId);
    if (!existing) {
      throw new Error(`Execution environment not found: ${executionEnvironmentId}`);
    }

    const validation = await this.executionEnvironmentValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.executionEnvironmentRepository.findByName(input.name.trim());
      if (duplicate && duplicate.executionEnvironmentId !== existing.executionEnvironmentId) {
        throw new Error(`Execution environment already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createExecutionEnvironment({
      executionEnvironmentId: existing.executionEnvironmentId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.executionEnvironmentRepository.save(updated);
    await this.executionEnvironmentCatalog.register(updated);
    return updated;
  }

  async deleteExecutionEnvironment(
    executionEnvironmentId: string,
  ): Promise<DeleteExecutionEnvironmentResult> {
    const normalizedExecutionEnvironmentId = executionEnvironmentId.trim();
    const deleted = await this.executionEnvironmentRepository.delete(normalizedExecutionEnvironmentId);
    if (deleted) {
      await this.executionEnvironmentCatalog.remove(normalizedExecutionEnvironmentId);
    }
    return Object.freeze({ executionEnvironmentId: normalizedExecutionEnvironmentId, deleted });
  }

  async findExecutionEnvironmentByName(name: string): Promise<FindExecutionEnvironmentByNameResult> {
    const normalizedName = name.trim();
    const executionEnvironment = await this.executionEnvironmentRepository.findByName(normalizedName);
    return Object.freeze({ executionEnvironment });
  }

  async listExecutionEnvironmentsByCategory(
    category: string,
  ): Promise<ListExecutionEnvironmentsByCategoryResult> {
    const normalizedCategory = category.trim();
    const executionEnvironments = Object.freeze(
      [...(await this.executionEnvironmentRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      executionEnvironments,
      total: executionEnvironments.length,
      category: normalizedCategory,
    });
  }

  async getExecutionEnvironmentRegistryStatistics(): Promise<ExecutionEnvironmentRegistryStatistics> {
    const executionEnvironments = await this.executionEnvironmentRepository.findAll();
    const activeExecutionEnvironments = executionEnvironments.filter(
      (executionEnvironment) => executionEnvironment.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(executionEnvironments.map((executionEnvironment) => executionEnvironment.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalExecutionEnvironments: executionEnvironments.length,
      activeExecutionEnvironments,
      categories,
    });
  }

  async serializeExecutionEnvironment(executionEnvironment: ExecutionEnvironment): Promise<string> {
    return this.executionEnvironmentSerializer.serialize(executionEnvironment);
  }

  async deserializeExecutionEnvironment(serialized: string): Promise<ExecutionEnvironment> {
    return this.executionEnvironmentSerializer.deserialize(serialized);
  }
}
