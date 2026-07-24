import { ApiNotFoundError, ApiValidationError } from "@server/api/errors/api.errors";
import { createSuccessResponse } from "@server/api/responses";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import { CreateOrderValidator } from "@server/api/validation";
import type { OrderApplicationService } from "@server/application/services/order-application.service";
import type { OrderReadModel } from "@server/domain/order";

/** Order HTTP controller — delegates to OrderApplicationService. */
export class OrderController {
  private readonly validator = new CreateOrderValidator();

  constructor(private readonly orders: OrderApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const validation = this.validator.validate(context.body);
    if (!validation.valid) {
      throw new ApiValidationError(this.validator.toFieldErrors(validation));
    }

    const dto = this.validator.toDto(context.body);
    const data = await this.orders.createOrder(dto);
    return this.ok(context, data, 201);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const orderId = context.params.id;
    if (!orderId?.trim()) {
      throw new ApiValidationError({ id: ["Order id is required"] });
    }

    const data = await this.orders.getOrder(orderId);
    if (!data) {
      throw new ApiNotFoundError("Order");
    }

    return this.ok(context, data);
  }

  private ok(context: ApiRequestContext, data: OrderReadModel, status = 200): ApiResponseEnvelope {
    return Object.freeze({
      status,
      headers: Object.freeze({ "content-type": "application/json" }),
      body: createSuccessResponse(data, { requestId: context.requestId }),
    });
  }
}
