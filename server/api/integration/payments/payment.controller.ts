import { ApiValidationError } from "@server/api/errors/api.errors";
import type { OrderApplicationService } from "@server/application/services/order-application.service";
import type { IPaymentProvider } from "@server/infrastructure/payments";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readHeader,
  readNumber,
  readRecordBody,
  readString,
} from "@server/api/integration/routing/integration-controller.helpers";

/** Payment HTTP controller — validates orders via application services, delegates to payment port. */
export class PaymentController {
  constructor(
    private readonly orders: OrderApplicationService,
    private readonly payments: IPaymentProvider,
  ) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const orderId = readString(body.orderId);
    if (!orderId) {
      throw new ApiValidationError({ orderId: ["orderId is required"] });
    }

    const order = await this.orders.getOrder(orderId);
    if (!order) {
      throw new ApiValidationError({ orderId: ["Order was not found"] });
    }

    const amount = readNumber(body.amount) ?? order.totals.total.amount;
    const currency = readString(body.currency) ?? order.totals.total.currency;
    const idempotencyKey =
      readHeader(context.headers, "idempotency-key") ??
      readString(body.idempotencyKey) ??
      `payment-${orderId}-${Date.now()}`;

    const payment = await this.payments.createPayment({
      orderId,
      amount,
      currency,
      idempotencyKey,
      description: readString(body.description) ?? `Order ${order.orderNumber}`,
      customerPhone: readString(body.customerPhone) ?? order.phone,
      metadata: Object.freeze({ orderNumber: order.orderNumber }),
    });

    return createJsonResponse(context, payment, 201);
  }

  async capture(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const providerPaymentId = readString(body.providerPaymentId);
    if (!providerPaymentId) {
      throw new ApiValidationError({ providerPaymentId: ["providerPaymentId is required"] });
    }

    const payment = await this.payments.capturePayment(providerPaymentId, readNumber(body.amount));
    return createJsonResponse(context, payment);
  }

  async cancel(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const providerPaymentId = readString(body.providerPaymentId);
    if (!providerPaymentId) {
      throw new ApiValidationError({ providerPaymentId: ["providerPaymentId is required"] });
    }

    const payment = await this.payments.cancelPayment(
      providerPaymentId,
      readString(body.reason),
    );
    return createJsonResponse(context, payment);
  }

  async refund(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const providerPaymentId = readString(body.providerPaymentId);
    if (!providerPaymentId) {
      throw new ApiValidationError({ providerPaymentId: ["providerPaymentId is required"] });
    }

    const payment = await this.payments.refundPayment(
      providerPaymentId,
      readNumber(body.amount),
      readString(body.reason),
    );
    return createJsonResponse(context, payment);
  }

  async getStatus(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const providerPaymentId = context.params.id;
    if (!providerPaymentId?.trim()) {
      throw new ApiValidationError({ id: ["Payment id is required"] });
    }

    const payment = await this.payments.getPaymentStatus(providerPaymentId);
    return createJsonResponse(context, payment ?? { status: "not_found" });
  }
}
