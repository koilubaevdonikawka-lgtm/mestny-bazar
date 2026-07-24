import type { IDeliveryStatusProvider } from "@server/application/delivery-management/contracts/delivery-status-provider.contract";
import { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";

const TRANSITIONS: Readonly<Record<DeliveryStatus, readonly DeliveryStatus[]>> = Object.freeze({
  [DeliveryStatus.Pending]: Object.freeze([
    DeliveryStatus.Assigned,
    DeliveryStatus.Cancelled,
  ]),
  [DeliveryStatus.Assigned]: Object.freeze([
    DeliveryStatus.InTransit,
    DeliveryStatus.Cancelled,
  ]),
  [DeliveryStatus.InTransit]: Object.freeze([
    DeliveryStatus.Delivered,
    DeliveryStatus.Cancelled,
  ]),
  [DeliveryStatus.Delivered]: Object.freeze([]),
  [DeliveryStatus.Cancelled]: Object.freeze([]),
});

/** Default delivery status transition rules. */
export class DefaultDeliveryStatusProvider implements IDeliveryStatusProvider {
  canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  getAllowedTransitions(from: DeliveryStatus): readonly DeliveryStatus[] {
    return TRANSITIONS[from];
  }

  isTerminal(status: DeliveryStatus): boolean {
    return status === DeliveryStatus.Delivered || status === DeliveryStatus.Cancelled;
  }
}
