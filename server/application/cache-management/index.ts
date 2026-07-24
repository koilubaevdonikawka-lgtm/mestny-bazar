export type { ICacheRepository } from "./contracts/cache-repository.contract";
export type { ICacheSerializer } from "./contracts/cache-serializer.contract";
export type { ICacheExpirationPolicy } from "./contracts/cache-expiration-policy.contract";
export type { ICacheStatisticsProvider } from "./contracts/cache-statistics-provider.contract";
export type { ICacheKeyGenerator } from "./contracts/cache-key-generator.contract";
export type {
  IRedisCacheProvider,
  IMemoryCacheProvider,
  IHybridCacheProvider,
  IDistributedCacheProvider,
  ICacheInvalidationProvider,
} from "./contracts/cache-extension-ports.contract";
export {
  createCacheEntry,
  normalizeCacheGroup,
} from "./models/cache-entry.model";
export type {
  CacheEntry,
  SetCacheValueInput,
  CacheValueResult,
  CacheKeyExistsResult,
  DeleteCacheGroupResult,
  ClearCacheResult,
  CacheStatistics,
  ListCacheKeysResult,
} from "./models/cache-entry.model";
export { CacheManagementService } from "./services/cache-management.service";
export { CacheManagementApplicationService } from "./services/cache-management-application.service";
export {
  SetCacheValueUseCase,
  GetCacheValueUseCase,
  CacheKeyExistsUseCase,
  DeleteCacheValueUseCase,
  DeleteCacheGroupUseCase,
  ClearCacheUseCase,
  GetCacheStatisticsUseCase,
  ListCacheKeysUseCase,
} from "./use-cases/cache-management.use-cases";
