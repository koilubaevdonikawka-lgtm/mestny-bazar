import type { IExperimentCatalog } from "@server/application/ai-experiment-registry/contracts/experiment-catalog.contract";
import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Default in-memory experiment catalog index. */
export class DefaultExperimentCatalog implements IExperimentCatalog {
  private readonly experiments = new Map<string, Experiment>();
  private readonly experimentsByName = new Map<string, string>();
  private readonly experimentsByCategory = new Map<string, Set<string>>();

  async register(experiment: Experiment): Promise<void> {
    const existing = this.experiments.get(experiment.experimentId);
    if (existing) {
      if (existing.name !== experiment.name) {
        this.experimentsByName.delete(existing.name);
      }
      if (existing.category !== experiment.category) {
        this.removeFromCategory(existing.category, existing.experimentId);
      }
    }

    this.experiments.set(experiment.experimentId, experiment);
    this.experimentsByName.set(experiment.name, experiment.experimentId);
    this.addToCategory(experiment.category, experiment.experimentId);
  }

  async remove(experimentId: string): Promise<void> {
    const experiment = this.experiments.get(experimentId.trim());
    if (!experiment) {
      return;
    }
    this.experiments.delete(experiment.experimentId);
    this.experimentsByName.delete(experiment.name);
    this.removeFromCategory(experiment.category, experiment.experimentId);
  }

  async findById(experimentId: string): Promise<Experiment | null> {
    return this.experiments.get(experimentId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Experiment | null> {
    const experimentId = this.experimentsByName.get(name.trim());
    if (!experimentId) {
      return null;
    }
    return this.experiments.get(experimentId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Experiment[]> {
    const experimentIds = this.experimentsByCategory.get(category.trim());
    if (!experimentIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...experimentIds]
        .map((experimentId) => this.experiments.get(experimentId))
        .filter((experiment): experiment is Experiment => experiment !== undefined),
    );
  }

  async listAll(): Promise<readonly Experiment[]> {
    return Object.freeze([...this.experiments.values()]);
  }

  private addToCategory(category: string, experimentId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.experimentsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(experimentId);
    this.experimentsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, experimentId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.experimentsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(experimentId);
    if (categorySet.size === 0) {
      this.experimentsByCategory.delete(normalizedCategory);
    }
  }
}
