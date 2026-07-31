import type { OrderStatus } from "@shared/contracts/order";
import type { UserRole } from "@shared/contracts/user";

export type OrderLifecycleDenialCode = string;

/** Actor initiating a status transition request. */
export interface OrderLifecycleActor {
  id: string | null;
  roles?: UserRole[];
}

/**
 * Context for evaluating an order status transition.
 * Extended fields are hooks for future rules without changing the engine.
 */
export interface OrderLifecycleContext {
  orderId: string;
  currentStatus: OrderStatus;
  targetStatus: OrderStatus;
  actor: OrderLifecycleActor;
  reason?: string;
  /** order.created_at (DB) — the only source of truth for time-boxed rules (e.g. customer self-cancellation). Never a client-supplied elapsed time. */
  orderCreatedAt?: string;
}

export interface OrderLifecycleResult {
  allowed: boolean;
  denialCode?: OrderLifecycleDenialCode;
  message?: string;
}

export interface IOrderLifecyclePolicy {
  canTransition(context: OrderLifecycleContext): OrderLifecycleResult;
  assertCanTransition(context: OrderLifecycleContext): void;
}
