import { ApiNotFoundError, ApiValidationError } from "@server/api/errors/api.errors";
import { createSuccessResponse } from "@server/api/responses";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import { CreateCategoryValidator } from "@server/api/validation";
import type { CatalogApplicationService } from "@server/application/services/catalog-application.service";
import type { CatalogReadModel, CategoryReadModel } from "@server/domain/catalog";

/** Catalog HTTP controller — delegates to CatalogApplicationService. */
export class CatalogController {
  private readonly validator = new CreateCategoryValidator();

  constructor(private readonly catalogs: CatalogApplicationService) {}

  async createCategory(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const payload = mergeBodyWithParams(context.body, {
      catalogId: context.params.catalogId,
    });
    const validation = this.validator.validate(payload);
    if (!validation.valid) {
      throw new ApiValidationError(this.validator.toFieldErrors(validation));
    }

    const dto = this.validator.toDto(payload);
    const data = await this.catalogs.createCategory(dto);
    return this.ok(context, data, 201);
  }

  async getCatalog(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const catalogId = context.params.id;
    if (!catalogId?.trim()) {
      throw new ApiValidationError({ id: ["Catalog id is required"] });
    }

    const data = await this.catalogs.getCatalog(catalogId);
    if (!data) {
      throw new ApiNotFoundError("Catalog");
    }

    return this.ok(context, data);
  }

  private ok(
    context: ApiRequestContext,
    data: CatalogReadModel | CategoryReadModel,
    status = 200,
  ): ApiResponseEnvelope {
    return Object.freeze({
      status,
      headers: Object.freeze({ "content-type": "application/json" }),
      body: createSuccessResponse(data, { requestId: context.requestId }),
    });
  }
}

function mergeBodyWithParams(
  body: unknown,
  params: Record<string, string | undefined>,
): Record<string, unknown> {
  const base =
    typeof body === "object" && body !== null && !Array.isArray(body)
      ? { ...(body as Record<string, unknown>) }
      : {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      base[key] = value;
    }
  }

  return base;
}
