import type {
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";

export interface OrderLifecycleRule {
  /** Lower values run first. Order is defined per rule, composed in DI Container. */
  readonly order: number;
  /**
   * When false, an allowed result continues the chain (for global guard rules).
   * Defaults to true — terminal rules stop after allowing.
   */
  readonly terminal?: boolean;
  applies(context: OrderLifecycleContext): boolean;
  evaluate(context: OrderLifecycleContext): OrderLifecycleResult;
}
