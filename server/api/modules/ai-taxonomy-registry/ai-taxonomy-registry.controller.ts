import { ApiValidationError } from "@server/api/errors/api.errors";
import type { AiTaxonomyRegistryApplicationService } from "@server/application/ai-taxonomy-registry/services/ai-taxonomy-registry-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
} from "@server/api/modules/routing/module-controller.helpers";

/** AI Taxonomy Registry HTTP controller — taxonomy management only. */
export class AiTaxonomyRegistryController {
  constructor(
    private readonly taxonomyRegistry: AiTaxonomyRegistryApplicationService,
  ) {}

  async registerTaxonomy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
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

    const result = await this.taxonomyRegistry.registerTaxonomy({
      name,
      category,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value, 201);
  }

  async listTaxonomies(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.taxonomyRegistry.listTaxonomies();
    return createJsonResponse(context, result.value);
  }

  async getTaxonomy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taxonomyId = this.requireTaxonomyId(context);
    const result = await this.taxonomyRegistry.getTaxonomy(taxonomyId);
    if (!result.value) {
      throw new ApiValidationError({
        taxonomyId: [`Taxonomy not found: ${taxonomyId}`],
      });
    }
    return createJsonResponse(context, result.value);
  }

  async updateTaxonomy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taxonomyId = this.requireTaxonomyId(context);
    const body = readRecordBody(context.body);
    const name = readString(body.name);
    const category = readString(body.category);
    const description = readString(body.description);
    const version = readString(body.version);
    const status = this.readStatus(body.status);

    const result = await this.taxonomyRegistry.updateTaxonomy({
      taxonomyId,
      name: name ?? undefined,
      category: category ?? undefined,
      description: description ?? undefined,
      version: version ?? undefined,
      status,
    });
    return createJsonResponse(context, result.value);
  }

  async removeTaxonomy(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const taxonomyId = this.requireTaxonomyId(context);
    const result = await this.taxonomyRegistry.deleteTaxonomy(taxonomyId);
    return createJsonResponse(context, result.value);
  }

  async findByName(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const name = readString(context.params.name);
    if (!name) {
      throw new ApiValidationError({ name: ["name is required"] });
    }
    const result = await this.taxonomyRegistry.findTaxonomyByName(name);
    if (!result.value.taxonomy) {
      throw new ApiValidationError({ name: [`Taxonomy not found: ${name}`] });
    }
    return createJsonResponse(context, result.value);
  }

  async listByCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const category = readString(context.params.category);
    if (!category) {
      throw new ApiValidationError({ category: ["category is required"] });
    }
    const result = await this.taxonomyRegistry.listTaxonomiesByCategory(category);
    return createJsonResponse(context, result.value);
  }

  async statistics(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const result = await this.taxonomyRegistry.getTaxonomyRegistryStatistics();
    return createJsonResponse(context, result.value);
  }

  private requireTaxonomyId(context: ApiRequestContext): string {
    const taxonomyId = readString(context.params.taxonomyId);
    if (!taxonomyId) {
      throw new ApiValidationError({ taxonomyId: ["taxonomyId is required"] });
    }
    return taxonomyId;
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
