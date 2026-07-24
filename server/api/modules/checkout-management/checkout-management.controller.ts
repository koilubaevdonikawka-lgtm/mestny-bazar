import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CheckoutManagementApplicationService } from "@server/application/checkout-management/services/checkout-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Checkout management HTTP controller — Order Draft only, no payment. */
export class CheckoutManagementController {
  constructor(private readonly checkout: CheckoutManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const result = await this.checkout.create(customerId);
    return createJsonResponse(context, result.value, 201);
  }

  async validate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const body = readRecordBody(context.body);
    const checkoutId = readString(body.checkoutId) ?? readString(context.params.checkoutId);
    const result = await this.checkout.validate(customerId, checkoutId);
    return createJsonResponse(context, result.value);
  }

  async getSummary(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const checkoutId = this.requireCheckoutId(context);
    const result = await this.checkout.getSummary(checkoutId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async refresh(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const checkoutId = this.requireCheckoutId(context);
    const result = await this.checkout.refresh(customerId, checkoutId);
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const checkoutId = this.requireCheckoutId(context);
    const result = await this.checkout.cancel(customerId, checkoutId);
    return createJsonResponse(context, result.value);
  }

  private requireCheckoutId(context: ApiRequestContext): string {
    const checkoutId = readString(context.params.checkoutId);
    if (!checkoutId) {
      throw new ApiValidationError({ checkoutId: ["checkoutId is required"] });
    }
    return checkoutId;
  }
}
