import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiPersonaRegistryApplicationService } from "@server/application/ai-persona-registry/services/ai-persona-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Persona Registry HTTP controller — persona management only. */
export class AiPersonaRegistryController {
  constructor(private readonly personaRegistry: AiPersonaRegistryApplicationService) {}

  async registerPersona(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);

    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }

    const description = readString(body.description);
    const configuration = readString(body.configuration);
    const status = this.readStatus(body.status);

    const result = await this.personaRegistry.registerPersona({
      name,
      type,
      description: description ?? undefined,
      configuration: configuration ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listPersonas(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.personaRegistry.listPersonas();
    return createJsonResponse(context, result.value);
  }

  async getPersona(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const personaId = this.requirePersonaId(context);
    const result = await this.personaRegistry.getPersona(personaId);
    if (!result.value) {
      throw new ApiValidationError({
        personaId: [`Persona not found: ${personaId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updatePersona(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const personaId = this.requirePersonaId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const type = readString(body.type);
    const description = readString(body.description);
    const configuration = readString(body.configuration);
    const status = this.readStatus(body.status);

    const result = await this.personaRegistry.updatePersona({
      personaId,
      name: name ?? undefined,
      type: type ?? undefined,
      description: description ?? undefined,
      configuration: configuration ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removePersona(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const personaId = this.requirePersonaId(context);
    const result = await this.personaRegistry.deletePersona(personaId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.personaRegistry.findPersonaByName(name);
    if (!result.value.persona) {
      throw new ApiValidationError({ name: [`Persona not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByType(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const type = readString(context.params.type);
    if (!type) {
      throw new ApiValidationError({ type: ["type is required"] });
    }
    const result = await this.personaRegistry.listPersonasByType(type);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.personaRegistry.getPersonaRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requirePersonaId(context: ApiRequestContext): string {
    const personaId = readString(context.params.personaId);
    if (!personaId) {
      throw new ApiValidationError({ personaId: ["personaId is required"] });
    }
    return personaId;
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
