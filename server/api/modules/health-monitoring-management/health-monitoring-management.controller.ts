import { ApiValidationError } from "@server/api/errors/api.errors";
import type { HealthMonitoringManagementApplicationService } from "@server/application/health-monitoring-management/services/health-monitoring-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readQueryString,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** Health monitoring HTTP controller — component health checks only. */
export class HealthMonitoringManagementController {
  constructor(private readonly health: HealthMonitoringManagementApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const componentId = readString(body.componentId);
    const name = readString(body.name);
    const checkType = readString(body.checkType);

    if (!componentId) {
      throw new ApiValidationError({ componentId: ["componentId is required"] });
    }
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!checkType) {
      throw new ApiValidationError({ checkType: ["checkType is required"] });
    }

    const result = await this.health.registerCheck({ componentId, name, checkType });
    return createJsonResponse(context, result.value, 201);
  }

  async remove(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const checkId = this.requireCheckId(context);
    const result = await this.health.removeCheck(checkId);
    return createJsonResponse(context, result.value);
  }

  async list(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.health.listChecks();
    return createJsonResponse(context, result.value);
  }

  async run(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const checkId = this.requireCheckId(context);
    const result = await this.health.runCheck(checkId);
    return createJsonResponse(context, result.value);
  }

  async runAll(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.health.runAllChecks();
    return createJsonResponse(context, result.value);
  }

  async component(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const componentId = readString(context.params.componentId);
    if (!componentId) {
      throw new ApiValidationError({ componentId: ["componentId is required"] });
    }

    const result = await this.health.getComponentHealth(componentId);
    return createJsonResponse(context, result.value);
  }

  async system(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.health.getSystemHealth();
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const checkId = readQueryString(context.query, "checkId");
    const componentId = readQueryString(context.query, "componentId");
    const result = await this.health.getHealthHistory(checkId, componentId);
    return createJsonResponse(context, result.value);
  }

  private requireCheckId(context: ApiRequestContext): string {
    const checkId = readString(context.params.checkId);
    if (!checkId) {
      throw new ApiValidationError({ checkId: ["checkId is required"] });
    }
    return checkId;
  }
}
