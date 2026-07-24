import type { IConstraintCatalog } from "@server/application/ai-constraint-registry/contracts/constraint-catalog.contract";
import type { Constraint } from "@server/application/ai-constraint-registry/models/constraint.model";

/** Default in-memory constraint catalog index. */
export class DefaultConstraintCatalog implements IConstraintCatalog {
  private readonly constraints = new Map<string, Constraint>();
  private readonly constraintsByName = new Map<string, string>();
  private readonly constraintsByCategory = new Map<string, Set<string>>();

  async register(constraint: Constraint): Promise<void> {
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

  async remove(constraintId: string): Promise<void> {
    const constraint = this.constraints.get(constraintId.trim());
    if (!constraint) {
      return;
    }
    this.constraints.delete(constraint.constraintId);
    this.constraintsByName.delete(constraint.name);
    this.removeFromCategory(constraint.category, constraint.constraintId);
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

  async listAll(): Promise<readonly Constraint[]> {
    return Object.freeze([...this.constraints.values()]);
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
