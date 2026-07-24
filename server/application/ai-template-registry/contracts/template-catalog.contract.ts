import type { Template } from "@server/application/ai-template-registry/models/template.model";

export interface ITemplateCatalog {
  register(template: Template): Promise<void>;
  remove(templateId: string): Promise<void>;
  findById(templateId: string): Promise<Template | null>;
  findByName(name: string): Promise<Template | null>;
  findByCategory(category: string): Promise<readonly Template[]>;
  listAll(): Promise<readonly Template[]>;
}
