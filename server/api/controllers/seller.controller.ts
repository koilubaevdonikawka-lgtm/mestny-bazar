import { ApiNotFoundError, ApiValidationError } from "@server/api/errors/api.errors";
import { createSuccessResponse } from "@server/api/responses";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import { CreateSellerValidator } from "@server/api/validation";
import type { SellerApplicationService } from "@server/application/services/seller-application.service";
import type { SellerReadModel } from "@server/domain/seller";

/** Seller HTTP controller — delegates to SellerApplicationService. */
export class SellerController {
  private readonly validator = new CreateSellerValidator();

  constructor(private readonly sellers: SellerApplicationService) {}

  async register(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const validation = this.validator.validate(context.body);
    if (!validation.valid) {
      throw new ApiValidationError(this.validator.toFieldErrors(validation));
    }

    const dto = this.validator.toDto(context.body);
    const data = await this.sellers.registerSeller(dto);
    return this.ok(context, data, 201);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sellerId = context.params.id;
    if (!sellerId?.trim()) {
      throw new ApiValidationError({ id: ["Seller id is required"] });
    }

    const data = await this.sellers.getSeller(sellerId);
    if (!data) {
      throw new ApiNotFoundError("Seller");
    }

    return this.ok(context, data);
  }

  private ok(context: ApiRequestContext, data: SellerReadModel, status = 200): ApiResponseEnvelope {
    return Object.freeze({
      status,
      headers: Object.freeze({ "content-type": "application/json" }),
      body: createSuccessResponse(data, { requestId: context.requestId }),
    });
  }
}
