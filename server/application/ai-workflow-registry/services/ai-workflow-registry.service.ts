/**
 * AI Workflow Registry — unified registry for AI workflows.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IWorkflowCatalog } from "@server/application/ai-workflow-registry/contracts/workflow-catalog.contract";
import type { IWorkflowRepository } from "@server/application/ai-workflow-registry/contracts/workflow-repository.contract";
import type { IWorkflowSerializer } from "@server/application/ai-workflow-registry/contracts/workflow-serializer.contract";
import type { IWorkflowStatisticsProvider } from "@server/application/ai-workflow-registry/contracts/workflow-statistics-provider.contract";
import type { IWorkflowValidator } from "@server/application/ai-workflow-registry/contracts/workflow-validator.contract";
import {
  createWorkflow,
  type DeleteWorkflowResult,
  type FindWorkflowByNameResult,
  type ListWorkflowsByCategoryResult,
  type ListWorkflowsResult,
  type RegisterWorkflowInput,
  type UpdateWorkflowInput,
  type Workflow,
  type WorkflowRegistryStatistics,
} from "@server/application/ai-workflow-registry/models/workflow.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiWorkflowRegistryService {
  constructor(
    private readonly workflowRepository: IWorkflowRepository,
    private readonly workflowCatalog: IWorkflowCatalog,
    private readonly workflowValidator: IWorkflowValidator,
    private readonly workflowSerializer: IWorkflowSerializer,
    private readonly statisticsProvider: IWorkflowStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerWorkflow(input: RegisterWorkflowInput): Promise<Workflow> {
    const validation = await this.workflowValidator.validateRegistration(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const existingByName = await this.workflowRepository.findByName(input.name.trim());
    if (existingByName) {
      throw new Error(`Workflow already exists with name: ${input.name.trim()}`);
    }

    const workflow = createWorkflow({
      workflowId: this.idGenerator.generate(),
      name: input.name,
      category: input.category,
      description: input.description,
      version: input.version,
      status: input.status,
    });

    await this.workflowRepository.save(workflow);
    await this.workflowCatalog.register(workflow);
    return workflow;
  }

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return this.workflowRepository.findById(workflowId.trim());
  }

  async listWorkflows(): Promise<ListWorkflowsResult> {
    const workflows = Object.freeze(
      [...(await this.workflowRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ workflows, total: workflows.length });
  }

  async updateWorkflow(input: UpdateWorkflowInput): Promise<Workflow> {
    const workflowId = input.workflowId.trim();
    const existing = await this.workflowRepository.findById(workflowId);
    if (!existing) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const validation = await this.workflowValidator.validateUpdate(existing, input);
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (input.name !== undefined && input.name.trim() !== existing.name) {
      const duplicate = await this.workflowRepository.findByName(input.name.trim());
      if (duplicate && duplicate.workflowId !== existing.workflowId) {
        throw new Error(`Workflow already exists with name: ${input.name.trim()}`);
      }
    }

    const updated = createWorkflow({
      workflowId: existing.workflowId,
      name: input.name?.trim() ?? existing.name,
      category: input.category?.trim() ?? existing.category,
      description: input.description ?? existing.description,
      version: input.version?.trim() ?? existing.version,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.workflowRepository.save(updated);
    await this.workflowCatalog.register(updated);
    return updated;
  }

  async deleteWorkflow(workflowId: string): Promise<DeleteWorkflowResult> {
    const normalizedWorkflowId = workflowId.trim();
    const deleted = await this.workflowRepository.delete(normalizedWorkflowId);
    if (deleted) {
      await this.workflowCatalog.remove(normalizedWorkflowId);
    }
    return Object.freeze({ workflowId: normalizedWorkflowId, deleted });
  }

  async findWorkflowByName(name: string): Promise<FindWorkflowByNameResult> {
    const normalizedName = name.trim();
    const workflow = await this.workflowRepository.findByName(normalizedName);
    return Object.freeze({ workflow });
  }

  async listWorkflowsByCategory(category: string): Promise<ListWorkflowsByCategoryResult> {
    const normalizedCategory = category.trim();
    const workflows = Object.freeze(
      [...(await this.workflowRepository.findByCategory(normalizedCategory))].sort(
        (left, right) => left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({
      workflows,
      total: workflows.length,
      category: normalizedCategory,
    });
  }

  async getWorkflowRegistryStatistics(): Promise<WorkflowRegistryStatistics> {
    const workflows = await this.workflowRepository.findAll();
    const activeWorkflows = workflows.filter((workflow) => workflow.status === "active").length;
    const categories = Object.freeze([
      ...new Set(workflows.map((workflow) => workflow.category)),
    ].sort());

    return this.statisticsProvider.getStatistics({
      totalWorkflows: workflows.length,
      activeWorkflows,
      categories,
    });
  }

  async serializeWorkflow(workflow: Workflow): Promise<string> {
    return this.workflowSerializer.serialize(workflow);
  }

  async deserializeWorkflow(serialized: string): Promise<Workflow> {
    return this.workflowSerializer.deserialize(serialized);
  }
}
