/**
 * AI Constraint Registry — unified registry for AI constraints.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IConstraintCatalog } from "@server/application/ai-constraint-registry/contracts/constraint-catalog.contract";
import type { IConstraintRepository } from "@server/application/ai-constraint-registry/contracts/constraint-repository.contract";
import type { IConstraintSerializer } from "@server/application/ai-constraint-registry/contracts/constraint-serializer.contract";
import type { IConstraintStatisticsProvider } from "@server/application/ai-constraint-registry/contracts/constraint-statistics-provider.contract";
import type { IConstraintValidator } from "@server/application/ai-constraint-registry/contracts/constraint-validator.contract";
import {
  createConstraint,
  type DeleteConstraintResult,
  type FindConstraintByNameResult,
  type ListConstraintsByCategoryResult,
  type ListConstraintsResult,
  type RegisterConstraintInput,
  type Constraint,
  type ConstraintRegistryStatistics,
  type UpdateConstraintInput,
} from "@server/application/ai-constraint-registry/models/constraint.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiConstraintRegistryService {
  constructor(
    private readonly constraintRepository: IConstraintRepository,
    private readonly constraintCatalog: IConstraintCatalog,
    private readonly constraintValidator: IConstraintValidator,
    private readonly constraintSerializer: IConstraintSerializer,
    private readonly statisticsProvider: IConstraintStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerConstraint(input: RegisterConstraintInput): Promise<Constraint> {
    const validation = await this.constraintValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.constraintRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Constraint already exists with name: ${input.name.trim()}`);
    }

    const constraint = createConstraint({
      constraintId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.constraintRepository.save(constraint);
    await this.constraintCatalog.register(constraint);
    return constraint;
  }

  async getConstraint(constraintId: string): Promise<Constraint | null> {
    return this.constraintRepository.findById(constraintId.trim());
  }

  async listConstraints(): Promise<ListConstraintsResult> {
    const constraints = Object.freeze(
      [...(await this.constraintRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ constraints, total: constraints.length });
  }

  async updateConstraint(input: UpdateConstraintInput): Promise<Constraint> {
    const constraintId = input.constraintId.trim();
    const existing = await this.constraintRepository.findById(constraintId);
    if (!existing) {
      throw new Error(`Constraint not found: ${constraintId}`);
    }

    const validation = await this.constraintValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.constraintRepository.findByName(input.name.trim());
      if (duplicate && duplicate.constraintId !== existing.constraintId) {
        throw new Error(`Constraint already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createConstraint({
      constraintId: existing.constraintId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.constraintRepository.save(updated);
    await this.constraintCatalog.register(updated);
    return updated;
  }

  async deleteConstraint(constraintId: string): Promise<DeleteConstraintResult> {
    const normalizedConstraintId = constraintId.trim();
    const deleted = await this.constraintRepository.delete(normalizedConstraintId);
    if (deleted) {
      await this.constraintCatalog.remove(normalizedConstraintId);
    }
    return Object.freeze({ constraintId: normalizedConstraintId, deleted });
  }

  async findConstraintByName(name: string): Promise<FindConstraintByNameResult> {
    const normalizedName = name.trim();
    const constraint = await this.constraintRepository.findByName(normalizedName);
    return Object.freeze({ constraint });
  }

  async listConstraintsByCategory(category: string): Promise<ListConstraintsByCategoryResult> {
    const normalizedCategory = category.trim();
    const constraints = Object.freeze(
      [...(await this.constraintRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      constraints,
      total: constraints.length,
      category: normalizedCategory,
    });
  }

  async getConstraintRegistryStatistics(): Promise<ConstraintRegistryStatistics> {
    const constraints = await this.constraintRepository.findAll();
    const activeConstraints = constraints.filter((constraint) => constraint.status === "active").length;
    const categories = Object.freeze([
      ...new Set(constraints.map((constraint) => constraint.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalConstraints: constraints.length,
      activeConstraints,
      categories,
    });
  }

  async serializeConstraint(constraint: Constraint): Promise<string> {
    return this.constraintSerializer.serialize(constraint);
  }

  async deserializeConstraint(serialized: string): Promise<Constraint> {
    return this.constraintSerializer.deserialize(serialized);
  }
}
