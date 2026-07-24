import type { IWorkflowRepository } from "@server/application/ai-workflow-registry/contracts/workflow-repository.contract";
import type { Workflow } from "@server/application/ai-workflow-registry/models/workflow.model";

/** In-memory workflow store. */
export class WorkflowRepository implements IWorkflowRepository {
  private readonly workflows = new Map<string, Workflow>();
  private readonly workflowsByName = new Map<string, string>();
  private readonly workflowsByCategory = new Map<string, Set<string>>();

  async save(workflow: Workflow): Promise<void> {
    const existing = this.workflows.get(workflow.workflowId);
    if (existing) {
      if (existing.name !== workflow.name) {
        this.workflowsByName.delete(existing.name);
      }
      if (existing.category !== workflow.category) {
        this.removeFromCategory(existing.category, existing.workflowId);
      }
    }

    this.workflows.set(workflow.workflowId, workflow);
    this.workflowsByName.set(workflow.name, workflow.workflowId);
    this.addToCategory(workflow.category, workflow.workflowId);
  }

  async findById(workflowId: string): Promise<Workflow | null> {
    return this.workflows.get(workflowId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Workflow | null> {
    const workflowId = this.workflowsByName.get(name.trim());
    if (!workflowId) {
      return null;
    }
    return this.workflows.get(workflowId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Workflow[]> {
    const workflowIds = this.workflowsByCategory.get(category.trim());
    if (!workflowIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...workflowIds]
        .map((workflowId) => this.workflows.get(workflowId))
        .filter((workflow): workflow is Workflow => workflow !== undefined),
    );
  }

  async findAll(): Promise<readonly Workflow[]> {
    return Object.freeze([...this.workflows.values()]);
  }

  async delete(workflowId: string): Promise<boolean> {
    const workflow = await this.findById(workflowId);
    if (!workflow) {
      return false;
    }
    this.workflows.delete(workflow.workflowId);
    this.workflowsByName.delete(workflow.name);
    this.removeFromCategory(workflow.category, workflow.workflowId);
    return true;
  }

  private addToCategory(category: string, workflowId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.workflowsByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(workflowId);
    this.workflowsByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, workflowId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.workflowsByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(workflowId);
    if (categorySet.size === 0) {
      this.workflowsByCategory.delete(normalizedCategory);
    }
  }
}
