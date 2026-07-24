import type { ITemplateCatalog } from "@server/application/ai-template-registry/contracts/template-catalog.contract";
import type { Template } from "@server/application/ai-template-registry/models/template.model";

/** Default in-memory template catalog index. */
export class DefaultTemplateCatalog implements ITemplateCatalog {
  private readonly templates = new Map<string, Template>();
  private readonly templatesByName = new Map<string, string>();
  private readonly templatesByCategory = new Map<string, Set<string>>();

  async register(template: Template): Promise<void> {
    const existing = this.templates.get(template.templateId);
    if (existing) {
      if (existing.name !== template.name) {
        this.templatesByName.delete(existing.name);
      }
      if (existing.category !== template.category) {
        this.removeFromCategory(existing.category, existing.templateId);
      }
    }

    this.templates.set(template.templateId, template);
    this.templatesByName.set(template.name, template.templateId);
    this.addToCategory(template.category, template.templateId);
  }

  async remove(templateId: string): Promise<void> {
    const template = this.templates.get(templateId.trim());
    if (!template) {
      return;
    }
    this.templates.delete(template.templateId);
    this.templatesByName.delete(template.name);
    this.removeFromCategory(template.category, template.templateId);
  }

  async findById(templateId: string): Promise<Template | null> {
    return this.templates.get(templateId.trim()) ?? null;
  }

  async findByName(name: string): Promise<Template | null> {
    const templateId = this.templatesByName.get(name.trim());
    if (!templateId) {
      return null;
    }
    return this.templates.get(templateId) ?? null;
  }

  async findByCategory(category: string): Promise<readonly Template[]> {
    const templateIds = this.templatesByCategory.get(category.trim());
    if (!templateIds) {
      return Object.freeze([]);
    }
    return Object.freeze(
      [...templateIds]
        .map((templateId) => this.templates.get(templateId))
        .filter((template): template is Template => template !== undefined),
    );
  }

  async listAll(): Promise<readonly Template[]> {
    return Object.freeze([...this.templates.values()]);
  }

  private addToCategory(category: string, templateId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.templatesByCategory.get(normalizedCategory) ?? new Set<string>();
    categorySet.add(templateId);
    this.templatesByCategory.set(normalizedCategory, categorySet);
  }

  private removeFromCategory(category: string, templateId: string): void {
    const normalizedCategory = category.trim();
    const categorySet = this.templatesByCategory.get(normalizedCategory);
    if (!categorySet) {
      return;
    }
    categorySet.delete(templateId);
    if (categorySet.size === 0) {
      this.templatesByCategory.delete(normalizedCategory);
    }
  }
}
