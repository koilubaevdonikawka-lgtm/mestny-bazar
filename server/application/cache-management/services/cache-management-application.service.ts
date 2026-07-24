import type { SetCacheValueInput } from "@server/application/cache-management/models/cache-entry.model";
import {
  CacheKeyExistsUseCase,
  ClearCacheUseCase,
  DeleteCacheGroupUseCase,
  DeleteCacheValueUseCase,
  GetCacheStatisticsUseCase,
  GetCacheValueUseCase,
  ListCacheKeysUseCase,
  SetCacheValueUseCase,
} from "@server/application/cache-management/use-cases/cache-management.use-cases";

/** Application facade for cache management scenario. */
export class CacheManagementApplicationService {
  constructor(
    private readonly setCacheValueUseCase: SetCacheValueUseCase,
    private readonly getCacheValueUseCase: GetCacheValueUseCase,
    private readonly cacheKeyExistsUseCase: CacheKeyExistsUseCase,
    private readonly deleteCacheValueUseCase: DeleteCacheValueUseCase,
    private readonly deleteCacheGroupUseCase: DeleteCacheGroupUseCase,
    private readonly clearCacheUseCase: ClearCacheUseCase,
    private readonly getCacheStatisticsUseCase: GetCacheStatisticsUseCase,
    private readonly listCacheKeysUseCase: ListCacheKeysUseCase,
  ) {}

  setCacheValue(input: SetCacheValueInput) {
    return this.setCacheValueUseCase.execute(input);
  }

  getCacheValue(key: string) {
    return this.getCacheValueUseCase.execute(key);
  }

  cacheKeyExists(key: string) {
    return this.cacheKeyExistsUseCase.execute(key);
  }

  deleteCacheValue(key: string) {
    return this.deleteCacheValueUseCase.execute(key);
  }

  deleteCacheGroup(group: string) {
    return this.deleteCacheGroupUseCase.execute(group);
  }

  clearCache() {
    return this.clearCacheUseCase.execute();
  }

  getCacheStatistics() {
    return this.getCacheStatisticsUseCase.execute();
  }

  listCacheKeys() {
    return this.listCacheKeysUseCase.execute();
  }
}
