import {
  CancelOrderWorkflowUseCase,
  DeliveryCompletedWorkflowUseCase,
  PaymentFailedWorkflowUseCase,
  PaymentSucceededWorkflowUseCase,
  PlaceOrderWorkflowUseCase,
  WarehouseCompletedWorkflowUseCase,
} from "@server/application/workflow-orchestration/use-cases/workflow-orchestration.use-cases";

/** Application facade for workflow orchestration scenario. */
export class WorkflowOrchestrationApplicationService {
  constructor(
    private readonly placeOrderWorkflowUseCase: PlaceOrderWorkflowUseCase,
    private readonly paymentSucceededWorkflowUseCase: PaymentSucceededWorkflowUseCase,
    private readonly paymentFailedWorkflowUseCase: PaymentFailedWorkflowUseCase,
    private readonly warehouseCompletedWorkflowUseCase: WarehouseCompletedWorkflowUseCase,
    private readonly deliveryCompletedWorkflowUseCase: DeliveryCompletedWorkflowUseCase,
    private readonly cancelOrderWorkflowUseCase: CancelOrderWorkflowUseCase,
  ) {}

  placeOrder(customerId: string, checkoutId: string) {
    return this.placeOrderWorkflowUseCase.execute(customerId, checkoutId);
  }

  paymentSucceeded(paymentId: string) {
    return this.paymentSucceededWorkflowUseCase.execute(paymentId);
  }

  paymentFailed(paymentId: string, reason?: string) {
    return this.paymentFailedWorkflowUseCase.execute(paymentId, reason);
  }

  warehouseCompleted(taskId: string) {
    return this.warehouseCompletedWorkflowUseCase.execute(taskId);
  }

  deliveryCompleted(deliveryId: string) {
    return this.deliveryCompletedWorkflowUseCase.execute(deliveryId);
  }

  cancelOrder(orderId: string, customerId: string, reason?: string) {
    return this.cancelOrderWorkflowUseCase.execute(orderId, customerId, reason);
  }
}
