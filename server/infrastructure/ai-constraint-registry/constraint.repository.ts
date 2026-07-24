import type { IConstraintRepository } from "@server/application/ai-constraint-registry/contracts/constraint-repository.contract";
import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

/** In-memory constraint store. */
export class ConstraintRepository implements IConstraintRepository {
  private readonly constraints = new Map<string, Constraint>();
  private readonly constraintsByName = new Map<string, string>();
  private readonly constraintsByCategory = new Map<string, Set<string>>();

  async save(constraint: Constraint): Promise<void> {
    const existing = this.constraints.get(constraint.constraintId);
    if (existing) {
      if (existing.name !== constraint.name) {
        this.constraintsByName.delete(existing.name);
      }
      if (existing.category !== constraint.category) {
        this.removeFromCategory(existing.category, existing.constraintId);
      }
    }

    this.constraints.set(constraint.constraintId, constraint);
    this.constraintsByName.set(constraint.name, constraint.constraintId);
    this.addToCategory(constraint.category, constraint.constraintId);
  }

  async findById(constraintId: string): Promise<Constraint | null> {
    return this.constraints.get(constraintId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Constraint | null> {
    const constraintId = this.constraintsByName.get(name.trim());
    if (!constraintId) {
      return null;
    }
    return this.constraints.get(constraintId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Constraint[]> {
    const constraintIds = this.constraintsByCategory.get(category.trim());
    if (!constraintIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...constraintIds]
        .map((constraintId) => this.constraints.get(constraintId))
        .filter((constraint): constraint is Constraint => constraint !== undefined),
    );
  }

  async findAll(): Promise<readonly Constraint[]> {
    return Object.freeze([...this.constraints.values()]);
  }

  async delete(constraintId: string): Promise<boolean> {
    const constraint = await this.findById(constraintId);
    if (!constraint) {
      return false;
    }
    this.constraints.delete(constraint.constraintId);
    this.constraintsByName.delete(constraint.name);
    this.removeFromCategory(constraint.category, constraint.constraintId);
    return true;
  }

  private addToCategory(category: string, constraintId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.constraintsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(constraintId);
    this.constraintsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, constraintId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.constraintsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(constraintId);
    if (categorySet.size === 0) {
      this.constraintsByCategory.delete(normalizedCategory);
    }
  }
}
