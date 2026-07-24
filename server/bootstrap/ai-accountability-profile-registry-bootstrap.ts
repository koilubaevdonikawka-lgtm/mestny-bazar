import type { IAccountabilityProfileCatalog } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-catalog.contract";
import type { IAccountabilityProfileRepository } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-repository.contract";
import type { IAccountabilityProfileSerializer } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-serializer.contract";
import type { IAccountabilityProfileStatisticsProvider } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-statistics-provider.contract";
import type { IAccountabilityProfileValidator } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-validator.contract";
import {
  AiAccountabilityProfileRegistryApplicationService,
  AiAccountabilityProfileRegistryService,
  DeleteAccountabilityProfileUseCase,
  FindAccountabilityProfileByNameUseCase,
  GetAccountabilityProfileRegistryStatisticsUseCase,
  GetAccountabilityProfileUseCase,
  ListAccountabilityProfilesByCategoryUseCase,
  ListAccountabilityProfilesUseCase,
  RegisterAccountabilityProfileUseCase,
  UpdateAccountabilityProfileUseCase,
} from "@server/application/ai-accountability-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AccountabilityProfileRepository } from "@server/infrastructure/ai-accountability-profile-registry/accountability-profile.repository";
import { DefaultAccountabilityProfileCatalog } from "@server/infrastructure/ai-accountability-profile-registry/default-accountability-profile.catalog";
import { DefaultAccountabilityProfileStatisticsProvider } from "@server/infrastructure/ai-accountability-profile-registry/default-accountability-profile-statistics.provider";
import { DefaultAccountabilityProfileValidator } from "@server/infrastructure/ai-accountability-profile-registry/default-accountability-profile.validator";
import { JsonAccountabilityProfileSerializer } from "@server/infrastructure/ai-accountability-profile-registry/json-accountability-profile.serializer";

/** Registers AI Accountability Profile Registry services and use cases. */
export function registerAiAccountabilityProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileRepository,
    () => new AccountabilityProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileCatalog,
    () => new DefaultAccountabilityProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileValidator,
    () => new DefaultAccountabilityProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileSerializer,
    () => new JsonAccountabilityProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileStatisticsProvider,
    () => new DefaultAccountabilityProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryService,
    (provider) =>
      new AiAccountabilityProfileRegistryService(
        provider.resolve<IAccountabilityProfileRepository>(
          InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileRepository,
        ),
        provider.resolve<IAccountabilityProfileCatalog>(
          InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileCatalog,
        ),
        provider.resolve<IAccountabilityProfileValidator>(
          InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileValidator,
        ),
        provider.resolve<IAccountabilityProfileSerializer>(
          InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileSerializer,
        ),
        provider.resolve<IAccountabilityProfileStatisticsProvider>(
          InfrastructureTokens.AiAccountabilityProfileRegistryAccountabilityProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryRegisterAccountabilityProfileUseCase,
    (provider) =>
      new RegisterAccountabilityProfileUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryGetAccountabilityProfileUseCase,
    (provider) =>
      new GetAccountabilityProfileUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryListAccountabilityProfilesUseCase,
    (provider) =>
      new ListAccountabilityProfilesUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryUpdateAccountabilityProfileUseCase,
    (provider) =>
      new UpdateAccountabilityProfileUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryDeleteAccountabilityProfileUseCase,
    (provider) =>
      new DeleteAccountabilityProfileUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryFindAccountabilityProfileByNameUseCase,
    (provider) =>
      new FindAccountabilityProfileByNameUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryListAccountabilityProfilesByCategoryUseCase,
    (provider) =>
      new ListAccountabilityProfilesByCategoryUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryGetAccountabilityProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetAccountabilityProfileRegistryStatisticsUseCase(
        provider.resolve<AiAccountabilityProfileRegistryService>(
          InfrastructureTokens.AiAccountabilityProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAccountabilityProfileRegistryApplicationService,
    (provider) =>
      new AiAccountabilityProfileRegistryApplicationService(
        provider.resolve<RegisterAccountabilityProfileUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryRegisterAccountabilityProfileUseCase,
        ),
        provider.resolve<GetAccountabilityProfileUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryGetAccountabilityProfileUseCase,
        ),
        provider.resolve<ListAccountabilityProfilesUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryListAccountabilityProfilesUseCase,
        ),
        provider.resolve<UpdateAccountabilityProfileUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryUpdateAccountabilityProfileUseCase,
        ),
        provider.resolve<DeleteAccountabilityProfileUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryDeleteAccountabilityProfileUseCase,
        ),
        provider.resolve<FindAccountabilityProfileByNameUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryFindAccountabilityProfileByNameUseCase,
        ),
        provider.resolve<ListAccountabilityProfilesByCategoryUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryListAccountabilityProfilesByCategoryUseCase,
        ),
        provider.resolve<GetAccountabilityProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiAccountabilityProfileRegistryGetAccountabilityProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
