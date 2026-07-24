import type { DeliveryStatus } from "@server/application/delivery-management/models/delivery.model";

export interface IDeliveryStatusProvider {
  canTransition(from: DeliveryStatus, to: DeliveryStatus): boolean;
  getAllowedTransitions(from: DeliveryStatus): readonly DeliveryStatus[];
  isTerminal(status: DeliveryStatus): boolean;
}
