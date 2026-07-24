import type { IWorkflowTemplateCatalog } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-catalog.contract";
import type { WorkflowTemplate } from "@server/application/ai-workflow-template-registry/models/workflow-template.model";

/** Default in-memory workflow template catalog index. */
export class DefaultWorkflowTemplateCatalog implements IWorkflowTemplateCatalog {
  private readonly workflowTemplates = new Map<string, WorkflowTemplate>();
  private readonly workflowTemplatesByName = new Map<string, string>();
  private readonly workflowTemplatesByCategory = new Map<string, Set<string>>();

  async register(workflowTemplate: WorkflowTemplate): Promise<void> {
    const existing = this.workflowTemplates.get(workflowTemplate.workflowTemplateId);
    if (existing) {
      if (existing.name !== workflowTemplate.name) {
        this.workflowTemplatesByName.delete(existing.name);
      }
      if (existing.category !== workflowTemplate.category) {
        this.removeFromCategory(existing.category, existing.workflowTemplateId);
      }
    }

    this.workflowTemplates.set(workflowTemplate.workflowTemplateId, workflowTemplate);
    this.workflowTemplatesByName.set(workflowTemplate.name, workflowTemplate.workflowTemplateId);
    this.addToCategory(workflowTemplate.category, workflowTemplate.workflowTemplateId);
  }

  async remove(workflowTemplateId: string): Promise<void> {
    const workflowTemplate = this.workflowTemplates.get(workflowTemplateId.trim());
    if (!workflowTemplate) {
      return;
    }
    this.workflowTemplates.delete(workflowTemplate.workflowTemplateId);
    this.workflowTemplatesByName.delete(workflowTemplate.name);
    this.removeFromCategory(workflowTemplate.category, workflowTemplate.workflowTemplateId);
  }

  async findById(workflowTemplateId: string): Promise<WorkflowTemplate | null> {
    return this.workflowTemplates.get(workflowTemplateId.trim()) ?? null;
  }

  async findByName(name: string): Promise<WorkflowTemplate | null> {
    const workflowTemplateId = this.workflowTemplatesByName.get(name.trim());
    if (!workflowTemplateId) {
      return null;
    }
    return this.workflowTemplates.get(workflowTemplateId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly WorkflowTemplate[]> {
    const workflowTemplateIds = this.workflowTemplatesByCategory.get(category.trim());
    if (!workflowTemplateIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...workflowTemplateIds]
        .map((workflowTemplateId) => this.workflowTemplates.get(workflowTemplateId))
        .filter((workflowTemplate): workflowTemplate is WorkflowTemplate => workflowTemplate !== undefined),
    );
  }

  async listAll(): Promise<readonly WorkflowTemplate[]> {
    return Object.freeze([...this.workflowTemplates.values()]);
  }

  private addToCategory(category: string, workflowTemplateId: string): void {
    const normalizedCategory = category.trim();
    const categorySet =
      this.workflowTemplatesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(workflowTemplateId);
    this.workflowTemplatesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, workflowTemplateId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.workflowTemplatesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(workflowTemplateId);
    if (categorySet.size === 0) {
      this.workflowTemplatesByCategory.delete(normalizedCategory);
    }
  }
}
