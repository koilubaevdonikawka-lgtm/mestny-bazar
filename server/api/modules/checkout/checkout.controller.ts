import { ApiValidationError } from "@server/api/errors/api.errors";
import type { CheckoutModule } from "@server/application/modules/checkout";
import type { ApiRequestContext, ApiResponseEnvelope } from "@server/api/server/api.types";
import {
  createJsonResponse,
  readRecordBody,
  readString,
  resolveCustomerId,
} from "@server/api/modules/routing/module-controller.helpers";

/** Checkout HTTP controller — delegates to CheckoutModule. */
export class CheckoutController {
  constructor(private readonly checkout: CheckoutModule) {}

  async create(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const body = readRecordBody(context.body);
    const customerId = resolveCustomerId(context, body);
    const paymentMethod = readString(body.paymentMethod);
    const deliveryMethod = readString(body.deliveryMethod);

    if (!paymentMethod) {
      throw new ApiValidationError({ paymentMethod: ["paymentMethod is required"] });
    }
    if (!deliveryMethod) {
      throw new ApiValidationError({ deliveryMethod: ["deliveryMethod is required"] });
    }

    const session = await this.checkout.createCheckout({
      customerId,
      paymentMethod,
      deliveryMethod,
      comment: readString(body.comment) ?? null,
    });

    return createJsonResponse(context, session, 201);
  }

  async validate(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = context.params.id;
    if (!sessionId?.trim()) {
      throw new ApiValidationError({ id: ["Checkout session id is required"] });
    }

    const validation = await this.checkout.validateCheckout(sessionId);
    return createJsonResponse(context, validation);
  }

  async placeOrder(context: ApiRequestContext): Promise<ApiResponseEnvelope> {
    const sessionId = context.params.id;
    if (!sessionId?.trim()) {
      throw new ApiValidationError({ id: ["Checkout session id is required"] });
    }

    const result = await this.checkout.placeOrder(sessionId);
    return createJsonResponse(context, result, 201);
  }
}
