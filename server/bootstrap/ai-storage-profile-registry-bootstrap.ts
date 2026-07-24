import type { IStorageProfileCatalog } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-catalog.contract";
import type { IStorageProfileRepository } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-repository.contract";
import type { IStorageProfileSerializer } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-serializer.contract";
import type { IStorageProfileStatisticsProvider } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-statistics-provider.contract";
import type { IStorageProfileValidator } from "@server/application/ai-storage-profile-registry/contracts/storage-profile-validator.contract";
import {
  AiStorageProfileRegistryApplicationService,
  AiStorageProfileRegistryService,
  DeleteStorageProfileUseCase,
  FindStorageProfileByNameUseCase,
  GetStorageProfileRegistryStatisticsUseCase,
  GetStorageProfileUseCase,
  ListStorageProfilesByCategoryUseCase,
  ListStorageProfilesUseCase,
  RegisterStorageProfileUseCase,
  UpdateStorageProfileUseCase,
} from "@server/application/ai-storage-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { StorageProfileRepository } from "@server/infrastructure/ai-storage-profile-registry/storage-profile.repository";
import { DefaultStorageProfileCatalog } from "@server/infrastructure/ai-storage-profile-registry/default-storage-profile.catalog";
import { DefaultStorageProfileStatisticsProvider } from "@server/infrastructure/ai-storage-profile-registry/default-storage-profile-statistics.provider";
import { DefaultStorageProfileValidator } from "@server/infrastructure/ai-storage-profile-registry/default-storage-profile.validator";
import { JsonStorageProfileSerializer } from "@server/infrastructure/ai-storage-profile-registry/json-storage-profile.serializer";

/** Registers AI Storage Profile Registry services and use cases. */
export function registerAiStorageProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiStorageProfileRegistryStorageProfileRepository,
    () => new StorageProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStorageProfileRegistryStorageProfileCatalog,
    () => new DefaultStorageProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStorageProfileRegistryStorageProfileValidator,
    () => new DefaultStorageProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStorageProfileRegistryStorageProfileSerializer,
    () => new JsonStorageProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiStorageProfileRegistryStorageProfileStatisticsProvider,
    () => new DefaultStorageProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryService,
    (provider) =>
      new AiStorageProfileRegistryService(
        provider.resolve<IStorageProfileRepository>(
          InfrastructureTokens.AiStorageProfileRegistryStorageProfileRepository,
        ),
        provider.resolve<IStorageProfileCatalog>(
          InfrastructureTokens.AiStorageProfileRegistryStorageProfileCatalog,
        ),
        provider.resolve<IStorageProfileValidator>(
          InfrastructureTokens.AiStorageProfileRegistryStorageProfileValidator,
        ),
        provider.resolve<IStorageProfileSerializer>(
          InfrastructureTokens.AiStorageProfileRegistryStorageProfileSerializer,
        ),
        provider.resolve<IStorageProfileStatisticsProvider>(
          InfrastructureTokens.AiStorageProfileRegistryStorageProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryRegisterStorageProfileUseCase,
    (provider) =>
      new RegisterStorageProfileUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryGetStorageProfileUseCase,
    (provider) =>
      new GetStorageProfileUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryListStorageProfilesUseCase,
    (provider) =>
      new ListStorageProfilesUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryUpdateStorageProfileUseCase,
    (provider) =>
      new UpdateStorageProfileUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryDeleteStorageProfileUseCase,
    (provider) =>
      new DeleteStorageProfileUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryFindStorageProfileByNameUseCase,
    (provider) =>
      new FindStorageProfileByNameUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryListStorageProfilesByCategoryUseCase,
    (provider) =>
      new ListStorageProfilesByCategoryUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryGetStorageProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetStorageProfileRegistryStatisticsUseCase(
        provider.resolve<AiStorageProfileRegistryService>(
          InfrastructureTokens.AiStorageProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiStorageProfileRegistryApplicationService,
    (provider) =>
      new AiStorageProfileRegistryApplicationService(
        provider.resolve<RegisterStorageProfileUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryRegisterStorageProfileUseCase,
        ),
        provider.resolve<GetStorageProfileUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryGetStorageProfileUseCase,
        ),
        provider.resolve<ListStorageProfilesUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryListStorageProfilesUseCase,
        ),
        provider.resolve<UpdateStorageProfileUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryUpdateStorageProfileUseCase,
        ),
        provider.resolve<DeleteStorageProfileUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryDeleteStorageProfileUseCase,
        ),
        provider.resolve<FindStorageProfileByNameUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryFindStorageProfileByNameUseCase,
        ),
        provider.resolve<ListStorageProfilesByCategoryUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryListStorageProfilesByCategoryUseCase,
        ),
        provider.resolve<GetStorageProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiStorageProfileRegistryGetStorageProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
