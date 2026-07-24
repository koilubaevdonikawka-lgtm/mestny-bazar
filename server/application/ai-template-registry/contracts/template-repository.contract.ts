import type { Template } from "@server/application/ai-template-registry/models/template.model";

export interface ITemplateRepository {
  save(template: Template): Promise<void>;
  findById(templateId: string): Promise<Template | null>;
  findByName(name: string): Promise<Template | null>;
  findByCategory(category: string): Promise<readonly Template[]>;
  findAll(): Promise<readonly Template[]>;
  delete(templateId: string): Promise<boolean>;
}
