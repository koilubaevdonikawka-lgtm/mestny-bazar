import type { IOrderPaymentReader } from "@server/application/payment-management/contracts/order-payment-reader.contract";
import type { IPaymentEventPublisher } from "@server/application/payment-management/contracts/payment-event-publisher.contract";
import type { IPaymentGateway } from "@server/application/payment-management/contracts/payment-gateway.contract";
import type { IPaymentHistoryRepository } from "@server/application/payment-management/contracts/payment-history-repository.contract";
import type { IPaymentRepository } from "@server/application/payment-management/contracts/payment-repository.contract";
import type { IPaymentStatusProvider } from "@server/application/payment-management/contracts/payment-status-provider.contract";
import type { OrderManagementApplicationService } from "@server/application/order-management/services/order-management-application.service";
import {
  CancelPaymentUseCase,
  ConfirmPaymentUseCase,
  CreatePaymentUseCase,
  FailPaymentUseCase,
  GetPaymentHistoryUseCase,
  GetPaymentUseCase,
  PaymentManagementApplicationService,
  PaymentManagementService,
} from "@server/application/payment-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultPaymentStatusProvider } from "@server/infrastructure/payment-management/default-payment-status.provider";
import { MockPaymentGateway } from "@server/infrastructure/payment-management/mock-payment.gateway";
import { NoopPaymentEventPublisher } from "@server/infrastructure/payment-management/noop-payment-event.publisher";
import { OrderPaymentReaderAdapter } from "@server/infrastructure/payment-management/order-payment-reader.adapter";
import { PaymentHistoryRepository } from "@server/infrastructure/payment-management/payment-history.repository";
import { PaymentRepository } from "@server/infrastructure/payment-management/payment.repository";

/** Registers payment management services and use cases. */
export function registerPaymentManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.PaymentManagementRepository, () =>
    new PaymentRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.PaymentHistoryRepository, () =>
    new PaymentHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.OrderPaymentReader, (provider) =>
    new OrderPaymentReaderAdapter(
      provider.resolve<OrderManagementApplicationService>(
        InfrastructureTokens.OrderManagementApplicationService,
      ),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.PaymentManagementGateway, () =>
    new MockPaymentGateway(),
  );

  registry.registerSingleton(InfrastructureTokens.PaymentStatusProvider, () =>
    new DefaultPaymentStatusProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.PaymentEventPublisher, () =>
    new NoopPaymentEventPublisher(),
  );

  registry.registerTransient(InfrastructureTokens.PaymentManagementService, (provider) =>
    new PaymentManagementService(
      provider.resolve<IPaymentRepository>(InfrastructureTokens.PaymentManagementRepository),
      provider.resolve<IOrderPaymentReader>(InfrastructureTokens.OrderPaymentReader),
      provider.resolve<IPaymentGateway>(InfrastructureTokens.PaymentManagementGateway),
      provider.resolve<IPaymentStatusProvider>(InfrastructureTokens.PaymentStatusProvider),
      provider.resolve<IPaymentHistoryRepository>(InfrastructureTokens.PaymentHistoryRepository),
      provider.resolve<IPaymentEventPublisher>(InfrastructureTokens.PaymentEventPublisher),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(InfrastructureTokens.PaymentManagementCreatePaymentUseCase, (provider) =>
    new CreatePaymentUseCase(
      provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.PaymentManagementGetPaymentUseCase, (provider) =>
    new GetPaymentUseCase(
      provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
    ),
  );
  registry.registerTransient(
    InfrastructureTokens.PaymentManagementConfirmPaymentUseCase,
    (provider) =>
      new ConfirmPaymentUseCase(
        provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
      ),
  );
  registry.registerTransient(InfrastructureTokens.PaymentManagementFailPaymentUseCase, (provider) =>
    new FailPaymentUseCase(
      provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
    ),
  );
  registry.registerTransient(
    InfrastructureTokens.PaymentManagementCancelPaymentUseCase,
    (provider) =>
      new CancelPaymentUseCase(
        provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.PaymentManagementGetPaymentHistoryUseCase,
    (provider) =>
      new GetPaymentHistoryUseCase(
        provider.resolve<PaymentManagementService>(InfrastructureTokens.PaymentManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.PaymentManagementApplicationService,
    (provider) =>
      new PaymentManagementApplicationService(
        provider.resolve<CreatePaymentUseCase>(
          InfrastructureTokens.PaymentManagementCreatePaymentUseCase,
        ),
        provider.resolve<GetPaymentUseCase>(InfrastructureTokens.PaymentManagementGetPaymentUseCase),
        provider.resolve<ConfirmPaymentUseCase>(
          InfrastructureTokens.PaymentManagementConfirmPaymentUseCase,
        ),
        provider.resolve<FailPaymentUseCase>(
          InfrastructureTokens.PaymentManagementFailPaymentUseCase,
        ),
        provider.resolve<CancelPaymentUseCase>(
          InfrastructureTokens.PaymentManagementCancelPaymentUseCase,
        ),
        provider.resolve<GetPaymentHistoryUseCase>(
          InfrastructureTokens.PaymentManagementGetPaymentHistoryUseCase,
        ),
      ),
  );
}
