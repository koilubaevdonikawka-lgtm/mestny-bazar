import type { CreateOrderRequest, CreateOrderResponse } from "@shared/contracts/order";
import { resolveUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import {
  CheckoutValidationError,
  InsufficientStockError,
  InsufficientVariantStockError,
  ProductNotSynchronized,
} from "@server/domain/checkout.errors";
import { CashPaymentRequiresAuthentication } from "@server/domain/payment-policy.errors";

export async function executeCreateOrder(
  request: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  const userId = await resolveUserIdFromRequest();
  try {
    return await getServices().checkout.checkout(userId, request);
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      throw new Error(
        `Checkout validation failed: ${Object.entries(error.details)
          .map(([k, v]) => `${k}: ${v.join(", ")}`)
          .join("; ")}`,
      );
    }
    if (error instanceof CashPaymentRequiresAuthentication) {
      throw error;
    }
    if (error instanceof ProductNotSynchronized) {
      throw error;
    }
    if (error instanceof InsufficientStockError) {
      throw error;
    }
    if (error instanceof InsufficientVariantStockError) {
      throw error;
    }
    throw error;
  }
}
