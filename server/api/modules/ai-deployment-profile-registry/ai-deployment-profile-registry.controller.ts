import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiDeploymentProfileRegistryApplicationService } from "@server/application/ai-deployment-profile-registry/services/ai-deployment-profile-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Deployment Profile Registry HTTP controller — deployment profile management only. */
export class AiDeploymentProfileRegistryController {
  constructor(
    private readonly deploymentProfileRegistry: AiDeploymentProfileRegistryApplicationService,
  ) {}

  async registerDeploymentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.deploymentProfileRegistry.registerDeploymentProfile({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listDeploymentProfiles(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.deploymentProfileRegistry.listDeploymentProfiles();
    return createJsonResponse(context, result.value);
  }

  async getDeploymentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deploymentProfileId = this.requireDeploymentProfileId(context);
    const result = await this.deploymentProfileRegistry.getDeploymentProfile(deploymentProfileId);
    if (!result.value) {
      throw new ApiValidationError({
        deploymentProfileId: [`Deployment profile not found: ${deploymentProfileId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateDeploymentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deploymentProfileId = this.requireDeploymentProfileId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.deploymentProfileRegistry.updateDeploymentProfile({
      deploymentProfileId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeDeploymentProfile(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const deploymentProfileId = this.requireDeploymentProfileId(context);
    const result = await this.deploymentProfileRegistry.deleteDeploymentProfile(deploymentProfileId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.deploymentProfileRegistry.findDeploymentProfileByName(name);
    if (!result.value.deploymentProfile) {
      throw new ApiValidationError({ name: [`Deployment profile not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.deploymentProfileRegistry.listDeploymentProfilesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.deploymentProfileRegistry.getDeploymentProfileRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireDeploymentProfileId(context: ApiRequestContext): string {
    const deploymentProfileId = readString(context.params.deploymentProfileId);
    if (!deploymentProfileId) {
      throw new ApiValidationError({ deploymentProfileId: ["deploymentProfileId is required"] });
    }
    return deploymentProfileId;
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
