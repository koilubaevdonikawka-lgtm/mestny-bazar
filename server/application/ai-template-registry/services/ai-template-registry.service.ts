/**
 * AI Template Registry — unified registry for AI templates.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { ITemplateCatalog } from "@server/application/ai-template-registry/contracts/template-catalog.contract";
import type { ITemplateRepository } from "@server/application/ai-template-registry/contracts/template-repository.contract";
import type { ITemplateSerializer } from "@server/application/ai-template-registry/contracts/template-serializer.contract";
import type { ITemplateStatisticsProvider } from "@server/application/ai-template-registry/contracts/template-statistics-provider.contract";
import type { ITemplateValidator } from "@server/application/ai-template-registry/contracts/template-validator.contract";
import {
  createTemplate,
  type DeleteTemplateResult,
  type FindTemplateByNameResult,
  type ListTemplatesByCategoryResult,
  type ListTemplatesResult,
  type RegisterTemplateInput,
  type Template,
  type TemplateRegistryStatistics,
  type UpdateTemplateInput,
} from "@server/application/ai-template-registry/models/template.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiTemplateRegistryService {
  constructor(
    private readonly templateRepository: ITemplateRepository,
    private readonly templateCatalog: ITemplateCatalog,
    private readonly templateValidator: ITemplateValidator,
    private readonly templateSerializer: ITemplateSerializer,
    private readonly statisticsProvider: ITemplateStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerTemplate(input: RegisterTemplateInput): Promise<Template> {
    const validation = await this.templateValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.templateRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Template already exists with name: ${input.name.trim()}`);
    }

    const template = createTemplate({
      templateId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.templateRepository.save(template);
    await this.templateCatalog.register(template);
    return template;
  }

  async getTemplate(templateId: string): Promise<Template | null> {
    return this.templateRepository.findById(templateId.trim());
  }

  async listTemplates(): Promise<ListTemplatesResult> {
    const templates = Object.freeze(
      [...(await this.templateRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ templates, total: templates.length });
  }

  async updateTemplate(input: UpdateTemplateInput): Promise<Template> {
    const templateId = input.templateId.trim();
    const existing = await this.templateRepository.findById(templateId);
    if (!existing) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const validation = await this.templateValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.templateRepository.findByName(input.name.trim());
      if (duplicate && duplicate.templateId !== existing.templateId) {
        throw new Error(`Template already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createTemplate({
      templateId: existing.templateId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.templateRepository.save(updated);
    await this.templateCatalog.register(updated);
    return updated;
  }

  async deleteTemplate(templateId: string): Promise<DeleteTemplateResult> {
    const normalizedTemplateId = templateId.trim();
    const deleted = await this.templateRepository.delete(normalizedTemplateId);
    if (deleted) {
      await this.templateCatalog.remove(normalizedTemplateId);
    }
    return Object.freeze({ templateId: normalizedTemplateId, deleted });
  }

  async findTemplateByName(name: string): Promise<FindTemplateByNameResult> {
    const normalizedName = name.trim();
    const template = await this.templateRepository.findByName(normalizedName);
    return Object.freeze({ template });
  }

  async listTemplatesByCategory(category: string): Promise<ListTemplatesByCategoryResult> {
    const normalizedCategory = category.trim();
    const templates = Object.freeze(
      [...(await this.templateRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      templates,
      total: templates.length,
      category: normalizedCategory,
    });
  }

  async getTemplateRegistryStatistics(): Promise<TemplateRegistryStatistics> {
    const templates = await this.templateRepository.findAll();
    const activeTemplates = templates.filter((template) => template.status === "active").length;
    const categories = Object.freeze([
      ...new Set(templates.map((template) => template.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalTemplates: templates.length,
      activeTemplates,
      categories,
    });
  }

  async serializeTemplate(template: Template): Promise<string> {
    return this.templateSerializer.serialize(template);
  }

  async deserializeTemplate(serialized: string): Promise<Template> {
    return this.templateSerializer.deserialize(serialized);
  }
}
