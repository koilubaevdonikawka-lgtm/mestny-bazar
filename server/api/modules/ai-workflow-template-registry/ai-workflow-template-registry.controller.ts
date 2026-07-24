import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiWorkflowTemplateRegistryApplicationService } from "@server/application/ai-workflow-template-registry/services/ai-workflow-template-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Workflow Template Registry HTTP controller — workflow template management only. */
export class AiWorkflowTemplateRegistryController {
  constructor(
    private readonly workflowTemplateRegistry: AiWorkflowTemplateRegistryApplicationService,
  ) {}

  async registerWorkflowTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }

    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.workflowTemplateRegistry.registerWorkflowTemplate({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listWorkflowTemplates(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.workflowTemplateRegistry.listWorkflowTemplates();
    return createJsonResponse(context, result.value);
  }

  async getWorkflowTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const workflowTemplateId = this.requireWorkflowTemplateId(context);
    const result = await this.workflowTemplateRegistry.getWorkflowTemplate(workflowTemplateId);
    if (!result.value) {
      throw new ApiValidationError({
        workflowTemplateId: [`Workflow template not found: ${workflowTemplateId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateWorkflowTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const workflowTemplateId = this.requireWorkflowTemplateId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.workflowTemplateRegistry.updateWorkflowTemplate({
      workflowTemplateId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeWorkflowTemplate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const workflowTemplateId = this.requireWorkflowTemplateId(context);
    const result = await this.workflowTemplateRegistry.deleteWorkflowTemplate(workflowTemplateId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.workflowTemplateRegistry.findWorkflowTemplateByName(name);
    if (!result.value.workflowTemplate) {
      throw new ApiValidationError({ name: [`Workflow template not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.workflowTemplateRegistry.listWorkflowTemplatesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.workflowTemplateRegistry.getWorkflowTemplateRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireWorkflowTemplateId(context: ApiRequestContext): string {
    const workflowTemplateId = readString(context.params.workflowTemplateId);
    if (!workflowTemplateId) {
      throw new ApiValidationError({ workflowTemplateId: ["workflowTemplateId is required"] });
    }
    return workflowTemplateId;
  }

  private readStatus(value: unknown): "active" | "inactive" | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }
    if (value === "active" || value === "inactive") {
      return value;
    }
    throw new ApiValidationError({ status: ["status must be 'active' or 'inactive'"] });
  }
}
