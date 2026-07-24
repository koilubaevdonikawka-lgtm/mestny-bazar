export interface DeliveryWorkflowSnapshot {
  readonly deliveryId: string;
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
}

export interface CreateDeliveryWorkflowResult {
  readonly deliveryId: string;
  readonly orderId: string;
  readonly status: string;
}

/** Delivery coordination port for workflow orchestration. */
export interface IDeliveryWorkflowService {
  createDelivery(orderId: string): Promise<CreateDeliveryWorkflowResult>;
  completeDelivery(deliveryId: string): Promise<boolean>;
  cancelDelivery(deliveryId: string, customerId: string, reason?: string): Promise<boolean>;
  getDelivery(deliveryId: string): Promise<DeliveryWorkflowSnapshot | null>;
  findByOrderId(orderId: string): Promise<DeliveryWorkflowSnapshot | null>;
}
