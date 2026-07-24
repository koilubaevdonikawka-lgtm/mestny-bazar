import type {
  CacheKeyExistsResult,
  CacheStatistics,
  CacheValueResult,
  ClearCacheResult,
  DeleteCacheGroupResult,
  ListCacheKeysResult,
  SetCacheValueInput,
} from "@server/application/cache-management/models/cache-entry.model";
import type { CacheManagementService } from "@server/application/cache-management/services/cache-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class SetCacheValueUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(input: SetCacheValueInput): Promise<UseCaseResult<CacheValueResult>> {
    return this.cache.setCacheValue(input).then(useCaseResult);
  }
}

export class GetCacheValueUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(key: string): Promise<UseCaseResult<CacheValueResult | null>> {
    return this.cache.getCacheValue(key).then(useCaseResult);
  }
}

export class CacheKeyExistsUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(key: string): Promise<UseCaseResult<CacheKeyExistsResult>> {
    return this.cache.cacheKeyExists(key).then(useCaseResult);
  }
}

export class DeleteCacheValueUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(key: string): Promise<UseCaseResult<{ key: string; deleted: boolean }>> {
    return this.cache.deleteCacheValue(key).then(useCaseResult);
  }
}

export class DeleteCacheGroupUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(group: string): Promise<UseCaseResult<DeleteCacheGroupResult>> {
    return this.cache.deleteCacheGroup(group).then(useCaseResult);
  }
}

export class ClearCacheUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(): Promise<UseCaseResult<ClearCacheResult>> {
    return this.cache.clearCache().then(useCaseResult);
  }
}

export class GetCacheStatisticsUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(): Promise<UseCaseResult<CacheStatistics>> {
    return this.cache.getCacheStatistics().then(useCaseResult);
  }
}

export class ListCacheKeysUseCase {
  constructor(private readonly cache: CacheManagementService) {}

  execute(): Promise<UseCaseResult<ListCacheKeysResult>> {
    return this.cache.listCacheKeys().then(useCaseResult);
  }
}
