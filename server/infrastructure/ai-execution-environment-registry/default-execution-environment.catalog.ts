import type { IExecutionEnvironmentCatalog } from "@server/application/ai-execution-environment-registry/contracts/execution-environment-catalog.contract";
import type { ExecutionEnvironment } from "@server/application/ai-execution-environment-registry/models/execution-environment.model";

/** Default in-memory execution environment catalog index. */
export class DefaultExecutionEnvironmentCatalog implements IExecutionEnvironmentCatalog {
  private readonly executionEnvironments = new Map<string, ExecutionEnvironment>();
  private readonly executionEnvironmentsByName = new Map<string, string>();
  private readonly executionEnvironmentsByCategory = new Map<string, Set<string>>();

  async register(executionEnvironment: ExecutionEnvironment): Promise<void> {
    const existing = this.executionEnvironments.get(executionEnvironment.executionEnvironmentId);
    if (existing) {
      if (existing.name !== executionEnvironment.name) {
        this.executionEnvironmentsByName.delete(existing.name);
      }
      if (existing.category !== executionEnvironment.category) {
        this.removeFromCategory(existing.category, existing.executionEnvironmentId);
      }
    }

    this.executionEnvironments.set(executionEnvironment.executionEnvironmentId, executionEnvironment);
    this.executionEnvironmentsByName.set(
      executionEnvironment.name,
      executionEnvironment.executionEnvironmentId,
    );
    this.addToCategory(executionEnvironment.category, executionEnvironment.executionEnvironmentId);
  }

  async remove(executionEnvironmentId: string): Promise<void> {
    const executionEnvironment = this.executionEnvironments.get(executionEnvironmentId.trim());
    if (!executionEnvironment) {
      return;
    }
    this.executionEnvironments.delete(executionEnvironment.executionEnvironmentId);
    this.executionEnvironmentsByName.delete(executionEnvironment.name);
    this.removeFromCategory(executionEnvironment.category, executionEnvironment.executionEnvironmentId);
  }

  async findById(executionEnvironmentId: string): Promise<ExecutionEnvironment | null> {
    return this.executionEnvironments.get(executionEnvironmentId.trim()) ?? null;
  }

  async findByName(name: string): Promise<ExecutionEnvironment | null> {
    const executionEnvironmentId = this.executionEnvironmentsByName.get(name.trim());
    if (!executionEnvironmentId) {
      return null;
    }
    return this.executionEnvironments.get(executionEnvironmentId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly ExecutionEnvironment[]> {
    const executionEnvironmentIds = this.executionEnvironmentsByCategory.get(category.trim());
    if (!executionEnvironmentIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...executionEnvironmentIds]
        .map((executionEnvironmentId) => this.executionEnvironments.get(executionEnvironmentId))
        .filter(
          (executionEnvironment): executionEnvironment is ExecutionEnvironment =>
            executionEnvironment !== undefined,
        ),
    );
  }

  async listAll(): Promise<readonly ExecutionEnvironment[]> {
    return Object.freeze([...this.executionEnvironments.values()]);
  }

  private addToCategory(category: string, executionEnvironmentId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.executionEnvironmentsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(executionEnvironmentId);
    this.executionEnvironmentsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, executionEnvironmentId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.executionEnvironmentsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(executionEnvironmentId);
    if (categorySet.size === 0) {
      this.executionEnvironmentsByCategory.delete(normalizedCategory);
    }
  }
}
