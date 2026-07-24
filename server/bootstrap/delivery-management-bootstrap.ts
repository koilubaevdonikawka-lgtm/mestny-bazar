import type { ICourierProvider } from "@server/application/delivery-management/contracts/courier-provider.contract";
import type { IDeliveryEventPublisher } from "@server/application/delivery-management/contracts/delivery-event-publisher.contract";
import type { IDeliveryHistoryRepository } from "@server/application/delivery-management/contracts/delivery-history-repository.contract";
import type { IDeliveryRepository } from "@server/application/delivery-management/contracts/delivery-repository.contract";
import type { IDeliveryStatusProvider } from "@server/application/delivery-management/contracts/delivery-status-provider.contract";
import type { IOrderDeliveryReader } from "@server/application/delivery-management/contracts/order-delivery-reader.contract";
import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import {
  AssignCourierUseCase,
  CancelDeliveryUseCase,
  CreateDeliveryUseCase,
  DeliveryManagementApplicationService,
  DeliveryManagementService,
  GetDeliveriesUseCase,
  GetDeliveryHistoryUseCase,
  GetDeliveryUseCase,
  UpdateDeliveryStatusUseCase,
} from "@server/application/delivery-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultCourierProvider } from "@server/infrastructure/delivery-management/default-courier.provider";
import { DefaultDeliveryStatusProvider } from "@server/infrastructure/delivery-management/default-delivery-status.provider";
import { DeliveryHistoryRepository } from "@server/infrastructure/delivery-management/delivery-history.repository";
import { DeliveryRepository } from "@server/infrastructure/delivery-management/delivery.repository";
import { NoopDeliveryEventPublisher } from "@server/infrastructure/delivery-management/noop-delivery-event.publisher";
import { OrderDeliveryReaderAdapter } from "@server/infrastructure/delivery-management/order-delivery-reader.adapter";

/** Registers delivery management services and use cases. */
export function registerDeliveryManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.DeliveryManagementRepository, () =>
    new DeliveryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.DeliveryHistoryRepository, () =>
    new DeliveryHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.OrderDeliveryReader, (provider) =>
    new OrderDeliveryReaderAdapter(
      provider.resolve<OrderManagementApplicationService>(
        InfrastructureTokens.OrderManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.CourierProvider, () => new DefaultCourierProvider());

  registry.registerSingleton(InfrastructureTokens.DeliveryStatusProvider, () =>
    new DefaultDeliveryStatusProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.DeliveryEventPublisher, () =>
    new NoopDeliveryEventPublisher(),
  );

  registry.registerTransient(InfrastructureTokens.DeliveryManagementService, (provider) =>
    new DeliveryManagementService(
      provider.resolve<IDeliveryRepository>(InfrastructureTokens.DeliveryManagementRepository),
      provider.resolve<IOrderDeliveryReader>(InfrastructureTokens.OrderDeliveryReader),
      provider.resolve<ICourierProvider>(InfrastructureTokens.CourierProvider),
      provider.resolve<IDeliveryStatusProvider>(InfrastructureTokens.DeliveryStatusProvider),
      provider.resolve<IDeliveryHistoryRepository>(InfrastructureTokens.DeliveryHistoryRepository),
      provider.resolve<IDeliveryEventPublisher>(InfrastructureTokens.DeliveryEventPublisher),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementCreateDeliveryUseCase,
    (provider) =>
      new CreateDeliveryUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementAssignCourierUseCase,
    (provider) =>
      new AssignCourierUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementUpdateDeliveryStatusUseCase,
    (provider) =>
      new UpdateDeliveryStatusUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementGetDeliveryUseCase,
    (provider) =>
      new GetDeliveryUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementGetDeliveriesUseCase,
    (provider) =>
      new GetDeliveriesUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementCancelDeliveryUseCase,
    (provider) =>
      new CancelDeliveryUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementGetDeliveryHistoryUseCase,
    (provider) =>
      new GetDeliveryHistoryUseCase(
        provider.resolve<DeliveryManagementService>(InfrastructureTokens.DeliveryManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.DeliveryManagementApplicationService,
    (provider) =>
      new DeliveryManagementApplicationService(
        provider.resolve<CreateDeliveryUseCase>(
          InfrastructureTokens.DeliveryManagementCreateDeliveryUseCase,
        ),
        provider.resolve<AssignCourierUseCase>(
          InfrastructureTokens.DeliveryManagementAssignCourierUseCase,
        ),
        provider.resolve<UpdateDeliveryStatusUseCase>(
          InfrastructureTokens.DeliveryManagementUpdateDeliveryStatusUseCase,
        ),
        provider.resolve<GetDeliveryUseCase>(
          InfrastructureTokens.DeliveryManagementGetDeliveryUseCase,
        ),
        provider.resolve<GetDeliveriesUseCase>(
          InfrastructureTokens.DeliveryManagementGetDeliveriesUseCase,
        ),
        provider.resolve<CancelDeliveryUseCase>(
          InfrastructureTokens.DeliveryManagementCancelDeliveryUseCase,
        ),
        provider.resolve<GetDeliveryHistoryUseCase>(
          InfrastructureTokens.DeliveryManagementGetDeliveryHistoryUseCase,
        ),
      ),
  );
}
