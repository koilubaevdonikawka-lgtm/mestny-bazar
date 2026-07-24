import type { WorkflowOrchestrationService } from "@server/application/workflow-orchestration/services/workflow-orchestration.service";
import type {
  CancelOrderWorkflowResult,
  DeliveryCompletedWorkflowResult,
  PaymentFailedWorkflowResult,
  PaymentSucceededWorkflowResult,
  PlaceOrderWorkflowResult,
  WarehouseCompletedWorkflowResult,
} from "@server/application/workflow-orchestration/models/workflow-result.model";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class PlaceOrderWorkflowUseCase {
  constructor(private readonly workflow: WorkflowOrchestrationService) {}

  execute(customerId: string, checkoutId: string): Promise<UseCaseResult<PlaceOrderWorkflowResult>> {
    return this.workflow.placeOrder(customerId, checkoutId).then(useCaseResult);
  }
}

export class PaymentSucceededWorkflowUseCase {
  constructor(private readonly workflow: WorkflowOrchestrationService) {}

  execute(paymentId: string): Promise<UseCaseResult<PaymentSucceededWorkflowResult>> {
    return this.workflow.handlePaymentSucceeded(paymentId).then(useCaseResult);
  }
}

export class PaymentFailedWorkflowUseCase {
  constructor(private readonly workflow: WorkflowOrchestrationService) {}

  execute(
    paymentId: string,
    reason?: string,
  ): Promise<UseCaseResult<PaymentFailedWorkflowResult>> {
    return this.workflow.handlePaymentFailed(paymentId, reason).then(useCaseResult);
  }
}

export class WarehouseCompletedWorkflowUseCase {
  constructor(private readonly workflow: WorkflowOrchestrationService) {}

  execute(taskId: string): Promise<UseCaseResult<WarehouseCompletedWorkflowResult>> {
    return this.workflow.handleWarehouseCompleted(taskId).then(useCaseResult);
  }
}

export class DeliveryCompletedWorkflowUseCase {
  constructor(private readonly workflow: WorkflowOrchestrationService) {}

  execute(deliveryId: string): Promise<UseCaseResult<DeliveryCompletedWorkflowResult>> {
    return this.workflow.handleDeliveryCompleted(deliveryId).then(useCaseResult);
  }
}

export class CancelOrderWorkflowUseCase {
  constructor(private readonly workflow: WorkflowOrchestrationService) {}

  execute(
    orderId: string,
    customerId: string,
    reason?: string,
  ): Promise<UseCaseResult<CancelOrderWorkflowResult>> {
    return this.workflow.cancelOrder(orderId, customerId, reason).then(useCaseResult);
  }
}
