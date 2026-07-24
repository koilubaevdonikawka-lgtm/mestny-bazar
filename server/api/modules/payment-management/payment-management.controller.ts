import { ApiValidationError } from "@server/api/errors/api.errors";
import type { PaymentManagementApplicationService } from "@server/application/payment-management/services/payment-management-application.service";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Payment management HTTP controller — payment lifecycle only. */
export class PaymentManagementController {
  constructor(private readonly payments: PaymentManagementApplicationService) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const body = readRecordBody(context.body);
    const orderId = readString(body.orderId);
    if (!orderId) {
      throw new ApiValidationError({ orderId: ["orderId is required"] });
    }

    const result = await this.payments.createPayment(customerId, orderId);
    return createJsonResponse(context, result.value, 201);
  }

  async getById(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const paymentId = this.requirePaymentId(context);
    const result = await this.payments.getPayment(paymentId);
    if (result.value === null) {
      return createJsonResponse(context, null, 404);
    }
    return createJsonResponse(context, result.value);
  }

  async confirm(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const paymentId = this.requirePaymentId(context);
    const result = await this.payments.confirmPayment(paymentId);
    return createJsonResponse(context, result.value);
  }

  async fail(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const paymentId = this.requirePaymentId(context);
    const body = readRecordBody(context.body);
    const result = await this.payments.failPayment(paymentId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const customerId = resolveCustomerId(context);
    const paymentId = this.requirePaymentId(context);
    const body = readRecordBody(context.body);
    const result = await this.payments.cancelPayment(paymentId, customerId, readString(body.reason));
    return createJsonResponse(context, result.value);
  }

  async history(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const paymentId = this.requirePaymentId(context);
    const result = await this.payments.getHistory(paymentId);
    return createJsonResponse(context, result.value);
  }

  private requirePaymentId(context: ApiRequestContext): string {
    const paymentId = readString(context.params.paymentId);
    if (!paymentId) {
      throw new ApiValidationError({ paymentId: ["paymentId is required"] });
    }
    return paymentId;
  }
}
