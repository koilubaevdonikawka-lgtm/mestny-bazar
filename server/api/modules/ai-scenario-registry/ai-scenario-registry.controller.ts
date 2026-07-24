import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiScenarioRegistryApplicationService } from "@server/application/ai-scenario-registry/services/ai-scenario-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Scenario Registry HTTP controller — scenario management only. */
export class AiScenarioRegistryController {
  constructor(
    private readonly scenarioRegistry: AiScenarioRegistryApplicationService,
  ) {}

  async registerScenario(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.scenarioRegistry.registerScenario({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listScenarios(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.scenarioRegistry.listScenarios();
    return createJsonResponse(context, result.value);
  }

  async getScenario(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const scenarioId = this.requireScenarioId(context);
    const result = await this.scenarioRegistry.getScenario(scenarioId);
    if (!result.value) {
      throw new ApiValidationError({
        scenarioId: [`Scenario not found: ${scenarioId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateScenario(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const scenarioId = this.requireScenarioId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.scenarioRegistry.updateScenario({
      scenarioId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeScenario(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const scenarioId = this.requireScenarioId(context);
    const result = await this.scenarioRegistry.deleteScenario(scenarioId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.scenarioRegistry.findScenarioByName(name);
    if (!result.value.scenario) {
      throw new ApiValidationError({ name: [`Scenario not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.scenarioRegistry.listScenariosByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.scenarioRegistry.getScenarioRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireScenarioId(context: ApiRequestContext): string {
    const scenarioId = readString(context.params.scenarioId);
    if (!scenarioId) {
      throw new ApiValidationError({ scenarioId: ["scenarioId is required"] });
    }
    return scenarioId;
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
