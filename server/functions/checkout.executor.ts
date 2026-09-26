import type { CreateOrderRequest, CreateOrderResponse } from "@shared/contracts/order";
import { resolveUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";
import { RateLimitPolicy } from "@server/domain/rate-limit.service";
import { enforceRateLimit } from "@server/functions/rate-limit.guard";
import {
  CheckoutValidationError,
  InsufficientStockError,
  InsufficientVariantStockError,
  ProductNotSynchronized,
} from "@server/domain/checkout.errors";

export async function executeCreateOrder(
  request: CreateOrderRequest,
): Promise<CreateOrderResponse> {
  // Guest checkout is back (Задача №314, reverting №182's sign-in
  // requirement): no session needed for either ONLINE or CASH. A guest
  // supplies phone/address in the request (CheckoutService validates them);
  // a signed-in customer's are still resolved from their profile.
  // Задача №288 — IP counter first, before any Supabase auth call, so a
  // flood is rejected at the edge; per-account counter once the caller is
  // known — a guest has no account, so only the IP counter applies to them.
  await enforceRateLimit(RateLimitPolicy.CHECKOUT);
  const userId = await resolveUserIdFromRequest();
  if (userId) {
    await enforceRateLimit(RateLimitPolicy.CHECKOUT, { userId, countIp: false });
  }
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
