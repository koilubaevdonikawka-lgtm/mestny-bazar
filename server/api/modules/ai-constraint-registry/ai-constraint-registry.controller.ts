import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiConstraintRegistryApplicationService } from "@server/application/ai-constraint-registry/services/ai-constraint-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Constraint Registry HTTP controller — constraint management only. */
export class AiConstraintRegistryController {
  constructor(
    private readonly constraintRegistry: AiConstraintRegistryApplicationService,
  ) {}

  async registerConstraint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.constraintRegistry.registerConstraint({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listConstraints(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.constraintRegistry.listConstraints();
    return createJsonResponse(context, result.value);
  }

  async getConstraint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const constraintId = this.requireConstraintId(context);
    const result = await this.constraintRegistry.getConstraint(constraintId);
    if (!result.value) {
      throw new ApiValidationError({
        constraintId: [`Constraint not found: ${constraintId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateConstraint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const constraintId = this.requireConstraintId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.constraintRegistry.updateConstraint({
      constraintId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeConstraint(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const constraintId = this.requireConstraintId(context);
    const result = await this.constraintRegistry.deleteConstraint(constraintId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.constraintRegistry.findConstraintByName(name);
    if (!result.value.constraint) {
      throw new ApiValidationError({ name: [`Constraint not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.constraintRegistry.listConstraintsByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.constraintRegistry.getConstraintRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireConstraintId(context: ApiRequestContext): string {
    const constraintId = readString(context.params.constraintId);
    if (!constraintId) {
      throw new ApiValidationError({ constraintId: ["constraintId is required"] });
    }
    return constraintId;
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
