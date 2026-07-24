import type { IEvaluationCatalog } from "@server/application/ai-evaluation-registry/contracts/evaluation-catalog.contract";
import type { Evaluation } from "@server/application/ai-evaluation-registry/models/evaluation.model";

/** Default in-memory evaluation catalog index. */
export class DefaultEvaluationCatalog implements IEvaluationCatalog {
  private readonly evaluations = new Map<string, Evaluation>();
  private readonly evaluationsByName = new Map<string, string>();
  private readonly evaluationsByCategory = new Map<string, Set<string>>();

  async register(evaluation: Evaluation): Promise<void> {
    const existing = this.evaluations.get(evaluation.evaluationId);
    if (existing) {
      if (existing.name !== evaluation.name) {
        this.evaluationsByName.delete(existing.name);
      }
      if (existing.category !== evaluation.category) {
        this.removeFromCategory(existing.category, existing.evaluationId);
      }
    }

    this.evaluations.set(evaluation.evaluationId, evaluation);
    this.evaluationsByName.set(evaluation.name, evaluation.evaluationId);
    this.addToCategory(evaluation.category, evaluation.evaluationId);
  }

  async remove(evaluationId: string): Promise<void> {
    const evaluation = this.evaluations.get(evaluationId.trim());
    if (!evaluation) {
      return;
    }
    this.evaluations.delete(evaluation.evaluationId);
    this.evaluationsByName.delete(evaluation.name);
    this.removeFromCategory(evaluation.category, evaluation.evaluationId);
  }

  async findById(evaluationId: string): Promise<Evaluation | null> {
    return this.evaluations.get(evaluationId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Evaluation | null> {
    const evaluationId = this.evaluationsByName.get(name.trim());
    if (!evaluationId) {
      return null;
    }
    return this.evaluations.get(evaluationId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Evaluation[]> {
    const evaluationIds = this.evaluationsByCategory.get(category.trim());
    if (!evaluationIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...evaluationIds]
        .map((evaluationId) => this.evaluations.get(evaluationId))
        .filter((evaluation): evaluation is Evaluation => evaluation !== undefined),
    );
  }

  async listAll(): Promise<readonly Evaluation[]> {
    return Object.freeze([...this.evaluations.values()]);
  }

  private addToCategory(category: string, evaluationId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.evaluationsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(evaluationId);
    this.evaluationsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, evaluationId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.evaluationsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(evaluationId);
    if (categorySet.size === 0) {
      this.evaluationsByCategory.delete(normalizedCategory);
    }
  }
}
