import type { ICheckoutWorkflowReader } from "@server/application/workflow-orchestration/contracts/checkout-workflow-reader.contract";
import type { IDeliveryWorkflowService } from "@server/application/workflow-orchestration/contracts/delivery-workflow-service.contract";
import type { INotificationWorkflowService } from "@server/application/workflow-orchestration/contracts/notification-workflow-service.contract";
import type { IOrderWorkflowService } from "@server/application/workflow-orchestration/contracts/order-workflow-service.contract";
import type { IPaymentWorkflowService } from "@server/application/workflow-orchestration/contracts/payment-workflow-service.contract";
import type { IWarehouseWorkflowService } from "@server/application/workflow-orchestration/contracts/warehouse-workflow-service.contract";
import type { CheckoutManagementApplicationService } from "@server/application/checkout-management/services/checkout-management-application.service";
import type { DeliveryManagementApplicationService } from "@server/application/delivery-management/services/delivery-management-application.service";
import type { DeliveryManagementService } from "@server/application/delivery-management/services/delivery-management.service";
import type { NotificationManagementApplicationService } from "@server/application/notification-management/services/notification-management-application.service";
import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import type { PaymentManagementApplicationService } from "@server/application/payment-management/services/payment-management-application.service";
import type { PaymentManagementService } from "@server/application/payment-management/services/payment-management.service";
import type { WarehouseManagementApplicationService } from "@server/application/warehouse-management/services/warehouse-management-application.service";
import {
  CancelOrderWorkflowUseCase,
  DeliveryCompletedWorkflowUseCase,
  PaymentFailedWorkflowUseCase,
  PaymentSucceededWorkflowUseCase,
  PlaceOrderWorkflowUseCase,
  WarehouseCompletedWorkflowUseCase,
  WorkflowOrchestrationApplicationService,
  WorkflowOrchestrationService,
} from "@server/application/workflow-orchestration";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CheckoutWorkflowReaderAdapter } from "@server/infrastructure/workflow-orchestration/checkout-workflow-reader.adapter";
import { DeliveryWorkflowServiceAdapter } from "@server/infrastructure/workflow-orchestration/delivery-workflow-service.adapter";
import { NotificationWorkflowServiceAdapter } from "@server/infrastructure/workflow-orchestration/notification-workflow-service.adapter";
import { OrderWorkflowServiceAdapter } from "@server/infrastructure/workflow-orchestration/order-workflow-service.adapter";
import { PaymentWorkflowServiceAdapter } from "@server/infrastructure/workflow-orchestration/payment-workflow-service.adapter";
import { WarehouseWorkflowServiceAdapter } from "@server/infrastructure/workflow-orchestration/warehouse-workflow-service.adapter";

/** Registers workflow orchestration services and use cases. */
export function registerWorkflowOrchestrationApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CheckoutWorkflowReader, (provider) =>
    new CheckoutWorkflowReaderAdapter(
      provider.resolve<CheckoutManagementApplicationService>(
        InfrastructureTokens.CheckoutManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.OrderWorkflowService, (provider) =>
    new OrderWorkflowServiceAdapter(
      provider.resolve<OrderManagementApplicationService>(
        InfrastructureTokens.OrderManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.PaymentWorkflowService, (provider) =>
    new PaymentWorkflowServiceAdapter(
      provider.resolve<PaymentManagementApplicationService>(
        InfrastructureTokens.PaymentManagementApplicationService,
      ),
      provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.WarehouseWorkflowService, (provider) =>
    new WarehouseWorkflowServiceAdapter(
      provider.resolve<WarehouseManagementApplicationService>(
        InfrastructureTokens.WarehouseManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.DeliveryWorkflowService, (provider) =>
    new DeliveryWorkflowServiceAdapter(
      provider.resolve<DeliveryManagementApplicationService>(
        InfrastructureTokens.DeliveryManagementApplicationService,
      ),
      provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.NotificationWorkflowService, (provider) =>
    new NotificationWorkflowServiceAdapter(
      provider.resolve<NotificationManagementApplicationService>(
        InfrastructureTokens.NotificationManagementApplicationService,
      ),
    ),
  );

  registry.registerTransient(InfrastructureTokens.WorkflowOrchestrationService, (provider) =>
    new WorkflowOrchestrationService(
      provider.resolve<ICheckoutWorkflowReader>(InfrastructureTokens.CheckoutWorkflowReader),
      provider.resolve<IOrderWorkflowService>(InfrastructureTokens.OrderWorkflowService),
      provider.resolve<IPaymentWorkflowService>(InfrastructureTokens.PaymentWorkflowService),
      provider.resolve<IWarehouseWorkflowService>(InfrastructureTokens.WarehouseWorkflowService),
      provider.resolve<IDeliveryWorkflowService>(InfrastructureTokens.DeliveryWorkflowService),
      provider.resolve<INotificationWorkflowService>(
        InfrastructureTokens.NotificationWorkflowService,
      ),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationPlaceOrderUseCase,
    (provider) =>
      new PlaceOrderWorkflowUseCase(
        provider.resolve<WorkflowOrchestrationService>(
          InfrastructureTokens.WorkflowOrchestrationService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationPaymentSucceededUseCase,
    (provider) =>
      new PaymentSucceededWorkflowUseCase(
        provider.resolve<WorkflowOrchestrationService>(
          InfrastructureTokens.WorkflowOrchestrationService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationPaymentFailedUseCase,
    (provider) =>
      new PaymentFailedWorkflowUseCase(
        provider.resolve<WorkflowOrchestrationService>(
          InfrastructureTokens.WorkflowOrchestrationService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationWarehouseCompletedUseCase,
    (provider) =>
      new WarehouseCompletedWorkflowUseCase(
        provider.resolve<WorkflowOrchestrationService>(
          InfrastructureTokens.WorkflowOrchestrationService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationDeliveryCompletedUseCase,
    (provider) =>
      new DeliveryCompletedWorkflowUseCase(
        provider.resolve<WorkflowOrchestrationService>(
          InfrastructureTokens.WorkflowOrchestrationService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationCancelOrderUseCase,
    (provider) =>
      new CancelOrderWorkflowUseCase(
        provider.resolve<WorkflowOrchestrationService>(
          InfrastructureTokens.WorkflowOrchestrationService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.WorkflowOrchestrationApplicationService,
    (provider) =>
      new WorkflowOrchestrationApplicationService(
        provider.resolve<PlaceOrderWorkflowUseCase>(
          InfrastructureTokens.WorkflowOrchestrationPlaceOrderUseCase,
        ),
        provider.resolve<PaymentSucceededWorkflowUseCase>(
          InfrastructureTokens.WorkflowOrchestrationPaymentSucceededUseCase,
        ),
        provider.resolve<PaymentFailedWorkflowUseCase>(
          InfrastructureTokens.WorkflowOrchestrationPaymentFailedUseCase,
        ),
        provider.resolve<WarehouseCompletedWorkflowUseCase>(
          InfrastructureTokens.WorkflowOrchestrationWarehouseCompletedUseCase,
        ),
        provider.resolve<DeliveryCompletedWorkflowUseCase>(
          InfrastructureTokens.WorkflowOrchestrationDeliveryCompletedUseCase,
        ),
        provider.resolve<CancelOrderWorkflowUseCase>(
          InfrastructureTokens.WorkflowOrchestrationCancelOrderUseCase,
        ),
      ),
  );
}
