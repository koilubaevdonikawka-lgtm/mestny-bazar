import {
  AcceptDeliveryUseCase,
  ArriveToCustomerUseCase,
  AssignCourierUseCase,
  CancelOrderUseCase,
  CompleteDeliveryUseCase,
  GetOrderTimelineUseCase,
  RefundOrderUseCase,
  ReturnOrderUseCase,
  StartDeliveryUseCase,
} from "@server/application/order-lifecycle/use-cases/order-lifecycle.use-cases";
import {
  OrderLifecycleApplicationService,
  OrderLifecycleService,
  OrderStatusChangeRecorder,
  OrderTimelineService,
} from "@server/application/order-lifecycle";
import type { ICourierStore } from "@server/application/modules/courier/courier/contracts";
import type {
  CourierModule,
  NotificationModule,
  OrderModule,
  PaymentModule,
  ReturnsModule,
} from "@server/application/modules";
import type { IOrderTimelineStore } from "@server/application/order-lifecycle/contracts/order-timeline-store.contract";
import type { IPaymentStore } from "@server/application/modules/payment/payment/contracts";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { IIdGenerator } from "@server/application/ports";

/** Registers order lifecycle services, timeline recorder, and use cases. */
export function registerOrderLifecycleApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.OrderStatusChangeHook,
    (provider) =>
      new OrderStatusChangeRecorder(
        provider.resolve<IOrderTimelineStore>(InfrastructureTokens.OrderTimelineStore),
        provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(InfrastructureTokens.OrderTimelineService, (provider) =>
    new OrderTimelineService(
      provider.resolve<IOrderTimelineStore>(InfrastructureTokens.OrderTimelineStore),
    ),
  );

  registry.registerTransient(InfrastructureTokens.OrderLifecycleService, (provider) =>
    new OrderLifecycleService(
      provider.resolve<OrderModule>(BootstrapTokens.OrderModule),
      provider.resolve<CourierModule>(BootstrapTokens.CourierModule),
      provider.resolve<ICourierStore>(InfrastructureTokens.CourierStore),
      provider.resolve<PaymentModule>(BootstrapTokens.PaymentModule),
      provider.resolve<IPaymentStore>(InfrastructureTokens.PaymentStore),
      provider.resolve<ReturnsModule>(BootstrapTokens.ReturnsModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.AssignCourierUseCase, (provider) =>
    new AssignCourierUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.AcceptDeliveryUseCase, (provider) =>
    new AcceptDeliveryUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.StartDeliveryUseCase, (provider) =>
    new StartDeliveryUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ArriveToCustomerUseCase, (provider) =>
    new ArriveToCustomerUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CompleteDeliveryUseCase, (provider) =>
    new CompleteDeliveryUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CancelOrderUseCase, (provider) =>
    new CancelOrderUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.ReturnOrderUseCase, (provider) =>
    new ReturnOrderUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.RefundOrderUseCase, (provider) =>
    new RefundOrderUseCase(
      provider.resolve<OrderLifecycleService>(InfrastructureTokens.OrderLifecycleService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetOrderTimelineUseCase, (provider) =>
    new GetOrderTimelineUseCase(
      provider.resolve<OrderTimelineService>(InfrastructureTokens.OrderTimelineService),
    ),
  );

  registry.registerTransient(InfrastructureTokens.OrderLifecycleApplicationService, (provider) =>
    new OrderLifecycleApplicationService(
      provider.resolve<AssignCourierUseCase>(InfrastructureTokens.AssignCourierUseCase),
      provider.resolve<AcceptDeliveryUseCase>(InfrastructureTokens.AcceptDeliveryUseCase),
      provider.resolve<StartDeliveryUseCase>(InfrastructureTokens.StartDeliveryUseCase),
      provider.resolve<ArriveToCustomerUseCase>(InfrastructureTokens.ArriveToCustomerUseCase),
      provider.resolve<CompleteDeliveryUseCase>(InfrastructureTokens.CompleteDeliveryUseCase),
      provider.resolve<CancelOrderUseCase>(InfrastructureTokens.CancelOrderUseCase),
      provider.resolve<ReturnOrderUseCase>(InfrastructureTokens.ReturnOrderUseCase),
      provider.resolve<RefundOrderUseCase>(InfrastructureTokens.RefundOrderUseCase),
      provider.resolve<GetOrderTimelineUseCase>(InfrastructureTokens.GetOrderTimelineUseCase),
    ),
  );
}
