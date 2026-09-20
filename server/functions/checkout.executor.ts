import type { CreateOrderRequest, CreateOrderResponse } from "@shared/contracts/order";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { RateLimitPolicy } from "@server/domain/rate-limit.service";
import { enforceRateLimit } from "@server/functions/rate-limit.guard";
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
  // Задача №182 — guest checkout removed entirely; order creation (including
  // ONLINE payment, previously guest-accessible) now requires an account.
  // Задача №288 — IP counter first, before any Supabase auth call, so a
  // flood is rejected at the edge; per-account counter once the caller is known.
  await enforceRateLimit(RateLimitPolicy.CHECKOUT);
  const userId = await requireUserIdFromRequest();
  await enforceRateLimit(RateLimitPolicy.CHECKOUT, { userId, countIp: false });
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
