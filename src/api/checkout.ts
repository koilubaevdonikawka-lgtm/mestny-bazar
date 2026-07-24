import type { CreateOrderRequest, CreateOrderResponse } from "@shared/contracts/order";
import { createOrder } from "@/api/orders";

/** Checkout API — delegates to createOrder (Platform Layer). */
export async function checkout(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  return createOrder(request);
}
