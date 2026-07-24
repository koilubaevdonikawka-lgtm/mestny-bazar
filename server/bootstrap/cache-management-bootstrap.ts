import type { ICacheExpirationPolicy } from "@server/application/cache-management/contracts/cache-expiration-policy.contract";
import type { ICacheKeyGenerator } from "@server/application/cache-management/contracts/cache-key-generator.contract";
import type { ICacheRepository } from "@server/application/cache-management/contracts/cache-repository.contract";
import type { ICacheSerializer } from "@server/application/cache-management/contracts/cache-serializer.contract";
import type { ICacheStatisticsProvider } from "@server/application/cache-management/contracts/cache-statistics-provider.contract";
import {
  CacheKeyExistsUseCase,
  CacheManagementApplicationService,
  CacheManagementService,
  ClearCacheUseCase,
  DeleteCacheGroupUseCase,
  DeleteCacheValueUseCase,
  GetCacheStatisticsUseCase,
  GetCacheValueUseCase,
  ListCacheKeysUseCase,
  SetCacheValueUseCase,
} from "@server/application/cache-management";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CacheRepository } from "@server/infrastructure/cache-management/cache.repository";
import { DefaultCacheExpirationPolicy } from "@server/infrastructure/cache-management/default-cache-expiration.policy";
import { DefaultCacheKeyGenerator } from "@server/infrastructure/cache-management/default-cache-key.generator";
import { DefaultCacheStatisticsProvider } from "@server/infrastructure/cache-management/default-cache-statistics.provider";
import { JsonCacheSerializer } from "@server/infrastructure/cache-management/json-cache.serializer";

/** Registers cache management services and use cases. */
export function registerCacheManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.CacheManagementCacheRepository, () =>
    new CacheRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.CacheManagementCacheSerializer, () =>
    new JsonCacheSerializer(),
  );

  registry.registerSingleton(InfrastructureTokens.CacheManagementCacheExpirationPolicy, () =>
    new DefaultCacheExpirationPolicy(),
  );

  registry.registerSingleton(
    InfrastructureTokens.CacheManagementCacheStatisticsProvider,
    () => new DefaultCacheStatisticsProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.CacheManagementCacheKeyGenerator, () =>
    new DefaultCacheKeyGenerator(),
  );

  registry.registerTransient(InfrastructureTokens.CacheManagementService, (provider) =>
    new CacheManagementService(
      provider.resolve<ICacheRepository>(InfrastructureTokens.CacheManagementCacheRepository),
      provider.resolve<ICacheSerializer>(InfrastructureTokens.CacheManagementCacheSerializer),
      provider.resolve<ICacheExpirationPolicy>(
        InfrastructureTokens.CacheManagementCacheExpirationPolicy,
      ),
      provider.resolve<ICacheStatisticsProvider>(
        InfrastructureTokens.CacheManagementCacheStatisticsProvider,
      ),
      provider.resolve<ICacheKeyGenerator>(InfrastructureTokens.CacheManagementCacheKeyGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.CacheManagementSetCacheValueUseCase,
    (provider) =>
      new SetCacheValueUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementGetCacheValueUseCase,
    (provider) =>
      new GetCacheValueUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementCacheKeyExistsUseCase,
    (provider) =>
      new CacheKeyExistsUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementDeleteCacheValueUseCase,
    (provider) =>
      new DeleteCacheValueUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementDeleteCacheGroupUseCase,
    (provider) =>
      new DeleteCacheGroupUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementClearCacheUseCase,
    (provider) =>
      new ClearCacheUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementGetCacheStatisticsUseCase,
    (provider) =>
      new GetCacheStatisticsUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.CacheManagementListCacheKeysUseCase,
    (provider) =>
      new ListCacheKeysUseCase(
        provider.resolve<CacheManagementService>(InfrastructureTokens.CacheManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.CacheManagementApplicationService,
    (provider) =>
      new CacheManagementApplicationService(
        provider.resolve<SetCacheValueUseCase>(
          InfrastructureTokens.CacheManagementSetCacheValueUseCase,
        ),
        provider.resolve<GetCacheValueUseCase>(
          InfrastructureTokens.CacheManagementGetCacheValueUseCase,
        ),
        provider.resolve<CacheKeyExistsUseCase>(
          InfrastructureTokens.CacheManagementCacheKeyExistsUseCase,
        ),
        provider.resolve<DeleteCacheValueUseCase>(
          InfrastructureTokens.CacheManagementDeleteCacheValueUseCase,
        ),
        provider.resolve<DeleteCacheGroupUseCase>(
          InfrastructureTokens.CacheManagementDeleteCacheGroupUseCase,
        ),
        provider.resolve<ClearCacheUseCase>(
          InfrastructureTokens.CacheManagementClearCacheUseCase,
        ),
        provider.resolve<GetCacheStatisticsUseCase>(
          InfrastructureTokens.CacheManagementGetCacheStatisticsUseCase,
        ),
        provider.resolve<ListCacheKeysUseCase>(
          InfrastructureTokens.CacheManagementListCacheKeysUseCase,
        ),
      ),
  );
}
