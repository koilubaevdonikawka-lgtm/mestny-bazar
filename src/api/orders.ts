import type { CreateOrderRequest, CreateOrderResponse, OrderDTO } from "@shared/contracts/order";
import { cancelOrderFn, createOrderFn, getOrderFn, listOrdersFn } from "@/api/orders.functions";

/** Creates an order via Platform Layer createOrderFn. userId is resolved server-side from JWT. */
export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  return createOrderFn({ data: request });
}

/** Lists orders for the authenticated user. userId is resolved server-side from JWT. */
export async function listOrders(): Promise<OrderDTO[]> {
  return listOrdersFn();
}

/** Fetches one order by id for the authenticated user. userId is resolved server-side from JWT. */
export async function getOrder(id: string): Promise<OrderDTO> {
  return getOrderFn({ data: { id } });
}

/** Cancels the caller's own order, if it hasn't entered assembly yet. */
export async function cancelOrder(id: string): Promise<OrderDTO> {
  return cancelOrderFn({ data: { id } });
}
