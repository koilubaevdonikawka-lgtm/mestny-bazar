import type { IPhoneVerificationProvider } from "@server/application/customer-management/contracts/phone-verification-provider.contract";
import type { IPhoneVerificationRepository } from "@server/application/customer-management/contracts/phone-verification-repository.contract";
import type {
  AnalyticsModule,
  CustomerModule,
  NotificationModule,
} from "@server/application/modules";
import type { IOrderStore } from "@server/application/modules/order/order/contracts";
import {
  AddCustomerAddressUseCase,
  CreateCustomerProfileUseCase,
  CustomerManagementApplicationService,
  CustomerManagementService,
  DeactivateCustomerUseCase,
  DeleteCustomerAddressUseCase,
  GetCustomerAddressesUseCase,
  GetCustomerProfileUseCase,
  GetOrderHistoryUseCase,
  RegisterCustomerUseCase,
  SetDefaultAddressUseCase,
  UpdateCustomerAddressUseCase,
  UpdateCustomerProfileUseCase,
  UpdateNotificationSettingsUseCase,
  VerifyPhoneUseCase,
} from "@server/application/customer-management";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultPhoneVerificationProvider } from "@server/infrastructure/customer/phone-verification/default-phone-verification.provider";
import { MemoryPhoneVerificationRepository } from "@server/infrastructure/customer/phone-verification/memory-phone-verification.repository";

/** Registers customer management services and use cases. */
export function registerCustomerManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.PhoneVerificationRepository,
    () => new MemoryPhoneVerificationRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.PhoneVerificationStore,
    (provider) =>
      provider.resolve<IPhoneVerificationRepository>(
        InfrastructureTokens.PhoneVerificationRepository,
      ),
  );

  registry.registerSingleton(InfrastructureTokens.PhoneVerificationProvider, (provider) =>
    new DefaultPhoneVerificationProvider(
      provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
    ),
  );

  registry.registerTransient(InfrastructureTokens.CustomerManagementService, (provider) =>
    new CustomerManagementService(
      provider.resolve<CustomerModule>(BootstrapTokens.CustomerModule),
      provider.resolve<IOrderStore>(InfrastructureTokens.OrderStore),
      provider.resolve<NotificationModule>(BootstrapTokens.NotificationModule),
      provider.resolve<AnalyticsModule>(BootstrapTokens.AnalyticsModule),
      provider.resolve<IPhoneVerificationRepository>(
        InfrastructureTokens.PhoneVerificationRepository,
      ),
      provider.resolve<IPhoneVerificationProvider>(InfrastructureTokens.PhoneVerificationProvider),
    ),
  );

  registry.registerTransient(InfrastructureTokens.RegisterCustomerUseCase, (provider) =>
    new RegisterCustomerUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.VerifyPhoneUseCase, (provider) =>
    new VerifyPhoneUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.CreateCustomerProfileUseCase, (provider) =>
    new CreateCustomerProfileUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UpdateCustomerProfileUseCase, (provider) =>
    new UpdateCustomerProfileUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.AddCustomerAddressUseCase, (provider) =>
    new AddCustomerAddressUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UpdateCustomerAddressUseCase, (provider) =>
    new UpdateCustomerAddressUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.DeleteCustomerAddressUseCase, (provider) =>
    new DeleteCustomerAddressUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.SetDefaultAddressUseCase, (provider) =>
    new SetDefaultAddressUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetCustomerAddressesUseCase, (provider) =>
    new GetCustomerAddressesUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetCustomerProfileUseCase, (provider) =>
    new GetCustomerProfileUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.UpdateNotificationSettingsUseCase, (provider) =>
    new UpdateNotificationSettingsUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.GetOrderHistoryUseCase, (provider) =>
    new GetOrderHistoryUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.DeactivateCustomerUseCase, (provider) =>
    new DeactivateCustomerUseCase(
      provider.resolve<CustomerManagementService>(InfrastructureTokens.CustomerManagementService),
    ),
  );

  registry.registerTransient(InfrastructureTokens.CustomerManagementApplicationService, (provider) =>
    new CustomerManagementApplicationService(
      provider.resolve<RegisterCustomerUseCase>(InfrastructureTokens.RegisterCustomerUseCase),
      provider.resolve<VerifyPhoneUseCase>(InfrastructureTokens.VerifyPhoneUseCase),
      provider.resolve<CreateCustomerProfileUseCase>(
        InfrastructureTokens.CreateCustomerProfileUseCase,
      ),
      provider.resolve<UpdateCustomerProfileUseCase>(
        InfrastructureTokens.UpdateCustomerProfileUseCase,
      ),
      provider.resolve<AddCustomerAddressUseCase>(InfrastructureTokens.AddCustomerAddressUseCase),
      provider.resolve<UpdateCustomerAddressUseCase>(
        InfrastructureTokens.UpdateCustomerAddressUseCase,
      ),
      provider.resolve<DeleteCustomerAddressUseCase>(
        InfrastructureTokens.DeleteCustomerAddressUseCase,
      ),
      provider.resolve<SetDefaultAddressUseCase>(InfrastructureTokens.SetDefaultAddressUseCase),
      provider.resolve<GetCustomerAddressesUseCase>(
        InfrastructureTokens.GetCustomerAddressesUseCase,
      ),
      provider.resolve<GetCustomerProfileUseCase>(InfrastructureTokens.GetCustomerProfileUseCase),
      provider.resolve<UpdateNotificationSettingsUseCase>(
        InfrastructureTokens.UpdateNotificationSettingsUseCase,
      ),
      provider.resolve<GetOrderHistoryUseCase>(InfrastructureTokens.GetOrderHistoryUseCase),
      provider.resolve<DeactivateCustomerUseCase>(InfrastructureTokens.DeactivateCustomerUseCase),
    ),
  );
}
