import type { IOrderStatusProvider } from "@server/application/order-management/contracts/order-status-provider.contract";
import { OrderManagementStatus } from "@server/application/order-management/models/customer-order.model";

const TRANSITIONS: Readonly<Record<OrderManagementStatus, readonly OrderManagementStatus[]>> =
  Object.freeze({
    [OrderManagementStatus.Created]: Object.freeze([
      OrderManagementStatus.Confirmed,
      OrderManagementStatus.Cancelled,
    ]),
    [OrderManagementStatus.Confirmed]: Object.freeze([
      OrderManagementStatus.Processing,
      OrderManagementStatus.Cancelled,
    ]),
    [OrderManagementStatus.Processing]: Object.freeze([
      OrderManagementStatus.Shipped,
      OrderManagementStatus.Cancelled,
    ]),
    [OrderManagementStatus.Shipped]: Object.freeze([OrderManagementStatus.Delivered]),
    [OrderManagementStatus.Delivered]: Object.freeze([]),
    [OrderManagementStatus.Cancelled]: Object.freeze([]),
  });

/** Default order status transition rules. */
export class DefaultOrderStatusProvider implements IOrderStatusProvider {
  canTransition(from: OrderManagementStatus, to: OrderManagementStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  getAllowedTransitions(from: OrderManagementStatus): readonly OrderManagementStatus[] {
    return TRANSITIONS[from];
  }

  isTerminal(status: OrderManagementStatus): boolean {
    return status === OrderManagementStatus.Delivered || status === OrderManagementStatus.Cancelled;
  }
}
