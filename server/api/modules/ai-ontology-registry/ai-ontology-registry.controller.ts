import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiOntologyRegistryApplicationService } from "@server/application/ai-ontology-registry/services/ai-ontology-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Ontology Registry HTTP controller — ontology management only. */
export class AiOntologyRegistryController {
  constructor(
    private readonly ontologyRegistry: AiOntologyRegistryApplicationService,
  ) {}

  async registerOntology(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.ontologyRegistry.registerOntology({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listOntologies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.ontologyRegistry.listOntologies();
    return createJsonResponse(context, result.value);
  }

  async getOntology(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ontologyId = this.requireOntologyId(context);
    const result = await this.ontologyRegistry.getOntology(ontologyId);
    if (!result.value) {
      throw new ApiValidationError({
        ontologyId: [`Ontology not found: ${ontologyId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateOntology(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ontologyId = this.requireOntologyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.ontologyRegistry.updateOntology({
      ontologyId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeOntology(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const ontologyId = this.requireOntologyId(context);
    const result = await this.ontologyRegistry.deleteOntology(ontologyId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.ontologyRegistry.findOntologyByName(name);
    if (!result.value.ontology) {
      throw new ApiValidationError({ name: [`Ontology not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.ontologyRegistry.listOntologiesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.ontologyRegistry.getOntologyRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireOntologyId(context: ApiRequestContext): string {
    const ontologyId = readString(context.params.ontologyId);
    if (!ontologyId) {
      throw new ApiValidationError({ ontologyId: ["ontologyId is required"] });
    }
    return ontologyId;
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
