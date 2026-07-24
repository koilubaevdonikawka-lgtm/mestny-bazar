/**
 * AI Workflow Template Registry — unified registry for AI workflow templates.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IWorkflowTemplateCatalog } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-catalog.contract";
import type { IWorkflowTemplateRepository } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-repository.contract";
import type { IWorkflowTemplateSerializer } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-serializer.contract";
import type { IWorkflowTemplateStatisticsProvider } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-statistics-provider.contract";
import type { IWorkflowTemplateValidator } from "@server/application/ai-workflow-template-registry/contracts/workflow-template-validator.contract";
import {
  createWorkflowTemplate,
  type DeleteWorkflowTemplateResult,
  type FindWorkflowTemplateByNameResult,
  type ListWorkflowTemplatesByCategoryResult,
  type ListWorkflowTemplatesResult,
  type RegisterWorkflowTemplateInput,
  type WorkflowTemplate,
  type WorkflowTemplateRegistryStatistics,
  type UpdateWorkflowTemplateInput,
} from "@server/application/ai-workflow-template-registry/models/workflow-template.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiWorkflowTemplateRegistryService {
  constructor(
    private readonly workflowTemplateRepository: IWorkflowTemplateRepository,
    private readonly workflowTemplateCatalog: IWorkflowTemplateCatalog,
    private readonly workflowTemplateValidator: IWorkflowTemplateValidator,
    private readonly workflowTemplateSerializer: IWorkflowTemplateSerializer,
    private readonly statisticsProvider: IWorkflowTemplateStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerWorkflowTemplate(input: RegisterWorkflowTemplateInput): Promise<WorkflowTemplate> {
    const validation = await this.workflowTemplateValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.workflowTemplateRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Workflow template already exists with name: ${input.name.trim()}`);
    }

    const workflowTemplate = createWorkflowTemplate({
      workflowTemplateId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.workflowTemplateRepository.save(workflowTemplate);
    await this.workflowTemplateCatalog.register(workflowTemplate);
    return workflowTemplate;
  }

  async getWorkflowTemplate(workflowTemplateId: string): Promise<WorkflowTemplate | null> {
    return this.workflowTemplateRepository.findById(workflowTemplateId.trim());
  }

  async listWorkflowTemplates(): Promise<ListWorkflowTemplatesResult> {
    const workflowTemplates = Object.freeze(
      [...(await this.workflowTemplateRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ workflowTemplates, total: workflowTemplates.length });
  }

  async updateWorkflowTemplate(input: UpdateWorkflowTemplateInput): Promise<WorkflowTemplate> {
    const workflowTemplateId = input.workflowTemplateId.trim();
    const existing = await this.workflowTemplateRepository.findById(workflowTemplateId);
    if (!existing) {
      throw new Error(`Workflow template not found: ${workflowTemplateId}`);
    }

    const validation = await this.workflowTemplateValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.workflowTemplateRepository.findByName(input.name.trim());
      if (duplicate && duplicate.workflowTemplateId !== existing.workflowTemplateId) {
        throw new Error(`Workflow template already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createWorkflowTemplate({
      workflowTemplateId: existing.workflowTemplateId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.workflowTemplateRepository.save(updated);
    await this.workflowTemplateCatalog.register(updated);
    return updated;
  }

  async deleteWorkflowTemplate(workflowTemplateId: string): Promise<DeleteWorkflowTemplateResult> {
    const normalizedWorkflowTemplateId = workflowTemplateId.trim();
    const deleted = await this.workflowTemplateRepository.delete(normalizedWorkflowTemplateId);
    if (deleted) {
      await this.workflowTemplateCatalog.remove(normalizedWorkflowTemplateId);
    }
    return Object.freeze({ workflowTemplateId: normalizedWorkflowTemplateId, deleted });
  }

  async findWorkflowTemplateByName(name: string): Promise<FindWorkflowTemplateByNameResult> {
    const normalizedName = name.trim();
    const workflowTemplate = await this.workflowTemplateRepository.findByName(normalizedName);
    return Object.freeze({ workflowTemplate });
  }

  async listWorkflowTemplatesByCategory(
    category: string,
  ): Promise<ListWorkflowTemplatesByCategoryResult> {
    const normalizedCategory = category.trim();
    const workflowTemplates = Object.freeze(
      [...(await this.workflowTemplateRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      workflowTemplates,
      total: workflowTemplates.length,
      category: normalizedCategory,
    });
  }

  async getWorkflowTemplateRegistryStatistics(): Promise<WorkflowTemplateRegistryStatistics> {
    const workflowTemplates = await this.workflowTemplateRepository.findAll();
    const activeWorkflowTemplates = workflowTemplates.filter(
      (workflowTemplate) => workflowTemplate.status === "active",
    ).length;
    const categories = Object.freeze([
      ...new Set(workflowTemplates.map((workflowTemplate) => workflowTemplate.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalWorkflowTemplates: workflowTemplates.length,
      activeWorkflowTemplates,
      categories,
    });
  }

  async serializeWorkflowTemplate(workflowTemplate: WorkflowTemplate): Promise<string> {
    return this.workflowTemplateSerializer.serialize(workflowTemplate);
  }

  async deserializeWorkflowTemplate(serialized: string): Promise<WorkflowTemplate> {
    return this.workflowTemplateSerializer.deserialize(serialized);
  }
}
