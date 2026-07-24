import type { IOrderWarehouseReader } from "@server/application/warehouse-management/contracts/order-warehouse-reader.contract";
import type { IPickerProvider } from "@server/application/warehouse-management/contracts/picker-provider.contract";
import type { IWarehouseEventPublisher } from "@server/application/warehouse-management/contracts/warehouse-event-publisher.contract";
import type { IWarehouseHistoryRepository } from "@server/application/warehouse-management/contracts/warehouse-history-repository.contract";
import type { IWarehouseRepository } from "@server/application/warehouse-management/contracts/warehouse-repository.contract";
import type { IWarehouseStatusProvider } from "@server/application/warehouse-management/contracts/warehouse-status-provider.contract";
import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import {
  AssignPickerUseCase,
  CancelPickingTaskUseCase,
  CompletePickingUseCase,
  CreatePickingTaskUseCase,
  GetPickingHistoryUseCase,
  GetPickingTaskUseCase,
  GetPickingTasksUseCase,
  UpdatePickingStatusUseCase,
  WarehouseManagementApplicationService,
  WarehouseManagementService,
} from "@server/application/warehouse-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultPickerProvider } from "@server/infrastructure/warehouse-management/default-picker.provider";
import { DefaultWarehouseStatusProvider } from "@server/infrastructure/warehouse-management/default-warehouse-status.provider";
import { NoopWarehouseEventPublisher } from "@server/infrastructure/warehouse-management/noop-warehouse-event.publisher";
import { OrderWarehouseReaderAdapter } from "@server/infrastructure/warehouse-management/order-warehouse-reader.adapter";
import { WarehouseHistoryRepository } from "@server/infrastructure/warehouse-management/warehouse-history.repository";
import { WarehouseRepository } from "@server/infrastructure/warehouse-management/warehouse.repository";

/** Registers warehouse management services and use cases. */
export function registerWarehouseManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.WarehouseManagementRepository, () =>
    new WarehouseRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.WarehouseManagementHistoryRepository, () =>
    new WarehouseHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.OrderWarehouseReader, (provider) =>
    new OrderWarehouseReaderAdapter(
      provider.resolve<OrderManagementApplicationService>(
        InfrastructureTokens.OrderManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.PickerProvider, () => new DefaultPickerProvider());

  registry.registerSingleton(InfrastructureTokens.WarehouseStatusProvider, () =>
    new DefaultWarehouseStatusProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.WarehouseEventPublisher, () =>
    new NoopWarehouseEventPublisher(),
  );

  registry.registerTransient(InfrastructureTokens.WarehouseManagementService, (provider) =>
    new WarehouseManagementService(
      provider.resolve<IWarehouseRepository>(InfrastructureTokens.WarehouseManagementRepository),
      provider.resolve<IOrderWarehouseReader>(InfrastructureTokens.OrderWarehouseReader),
      provider.resolve<IPickerProvider>(InfrastructureTokens.PickerProvider),
      provider.resolve<IWarehouseStatusProvider>(InfrastructureTokens.WarehouseStatusProvider),
      provider.resolve<IWarehouseHistoryRepository>(
        InfrastructureTokens.WarehouseManagementHistoryRepository,
      ),
      provider.resolve<IWarehouseEventPublisher>(InfrastructureTokens.WarehouseEventPublisher),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementCreatePickingTaskUseCase,
    (provider) =>
      new CreatePickingTaskUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementAssignPickerUseCase,
    (provider) =>
      new AssignPickerUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementUpdatePickingStatusUseCase,
    (provider) =>
      new UpdatePickingStatusUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementCompletePickingUseCase,
    (provider) =>
      new CompletePickingUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementGetPickingTaskUseCase,
    (provider) =>
      new GetPickingTaskUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementGetPickingTasksUseCase,
    (provider) =>
      new GetPickingTasksUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementCancelPickingTaskUseCase,
    (provider) =>
      new CancelPickingTaskUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementGetPickingHistoryUseCase,
    (provider) =>
      new GetPickingHistoryUseCase(
        provider.resolve<WarehouseManagementService>(InfrastructureTokens.WarehouseManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.WarehouseManagementApplicationService,
    (provider) =>
      new WarehouseManagementApplicationService(
        provider.resolve<CreatePickingTaskUseCase>(
          InfrastructureTokens.WarehouseManagementCreatePickingTaskUseCase,
        ),
        provider.resolve<AssignPickerUseCase>(
          InfrastructureTokens.WarehouseManagementAssignPickerUseCase,
        ),
        provider.resolve<UpdatePickingStatusUseCase>(
          InfrastructureTokens.WarehouseManagementUpdatePickingStatusUseCase,
        ),
        provider.resolve<CompletePickingUseCase>(
          InfrastructureTokens.WarehouseManagementCompletePickingUseCase,
        ),
        provider.resolve<GetPickingTaskUseCase>(
          InfrastructureTokens.WarehouseManagementGetPickingTaskUseCase,
        ),
        provider.resolve<GetPickingTasksUseCase>(
          InfrastructureTokens.WarehouseManagementGetPickingTasksUseCase,
        ),
        provider.resolve<CancelPickingTaskUseCase>(
          InfrastructureTokens.WarehouseManagementCancelPickingTaskUseCase,
        ),
        provider.resolve<GetPickingHistoryUseCase>(
          InfrastructureTokens.WarehouseManagementGetPickingHistoryUseCase,
        ),
      ),
  );
}
