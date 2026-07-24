import { ApiNotFoundError, ApiValidationError } from "@server/api/errors/api.errors";
import { createSuccessResponse } from "@server/api/responses";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import { CreateProductValidator } from "@server/api/validation";
import type { ProductApplicationService } from "@server/application/services/product-application.service";
import type { ProductReadModel } from "@server/domain/product";

/** Product HTTP controller — delegates to ProductApplicationService. */
export class ProductController {
  private readonly validator = new CreateProductValidator();

  constructor(private readonly products: ProductApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const validation = this.validator.validate(context.body);
    if (!validation.valid) {
      throw new ApiValidationError(this.validator.toFieldErrors(validation));
    }

    const dto = this.validator.toDto(context.body);
    const data = await this.products.createProduct(dto);
    return this.ok(context, data, 201);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const productId = context.params.id;
    if (!productId?.trim()) {
      throw new ApiValidationError({ id: ["Product id is required"] });
    }

    const data = await this.products.getProduct(productId);
    if (!data) {
      throw new ApiNotFoundError("Product");
    }

    return this.ok(context, data);
  }

  private ok(context: ApiRequestContext, data: ProductReadModel, status = 200): ApiResponseEnvelope {
    return Object.freeze({
      status,
      headers: Object.freeze({ "content-type": "application/json" }),
      body: createSuccessResponse(data, { requestId: context.requestId }),
    });
  }
}
