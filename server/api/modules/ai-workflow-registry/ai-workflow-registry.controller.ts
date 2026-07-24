import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiWorkflowRegistryApplicationService } from "@server/application/ai-workflow-registry/services/ai-workflow-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Workflow Registry HTTP controller — workflow management only. */
export class AiWorkflowRegistryController {
  constructor(private readonly workflowRegistry: AiWorkflowRegistryApplicationService) {}

  async registerWorkflow(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.workflowRegistry.registerWorkflow({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listWorkflows(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.workflowRegistry.listWorkflows();
    return createJsonResponse(context, result.value);
  }

  async getWorkflow(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const workflowId = this.requireWorkflowId(context);
    const result = await this.workflowRegistry.getWorkflow(workflowId);
    if (!result.value) {
      throw new ApiValidationError({
        workflowId: [`Workflow not found: ${workflowId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateWorkflow(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const workflowId = this.requireWorkflowId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.workflowRegistry.updateWorkflow({
      workflowId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeWorkflow(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const workflowId = this.requireWorkflowId(context);
    const result = await this.workflowRegistry.deleteWorkflow(workflowId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.workflowRegistry.findWorkflowByName(name);
    if (!result.value.workflow) {
      throw new ApiValidationError({ name: [`Workflow not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.workflowRegistry.listWorkflowsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.workflowRegistry.getWorkflowRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireWorkflowId(context: ApiRequestContext): string {
    const workflowId = readString(context.params.workflowId);
    if (!workflowId) {
      throw new ApiValidationError({ workflowId: ["workflowId is required"] });
    }
    return workflowId;
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
