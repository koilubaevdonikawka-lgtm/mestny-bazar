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
  /** Задача №135 — order.assignedCourierId (DB), for courier-ownership rules (Courier{StartDelivery,Arrive,CompleteDelivery}Rule) to check the acting courier actually owns this order, not just holds the courier role. */
  assignedCourierId?: string | null;
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
