import type {
  DeleteStorageProfileResult,
  FindStorageProfileByNameResult,
  StorageProfile,
  StorageProfileRegistryStatistics,
  ListStorageProfilesByCategoryResult,
  ListStorageProfilesResult,
  RegisterStorageProfileInput,
  UpdateStorageProfileInput,
} from "@server/application/ai-storage-profile-registry/models/storage-profile.model";
import type { AiStorageProfileRegistryService } from "@server/application/ai-storage-profile-registry/services/ai-storage-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterStorageProfileUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(input: RegisterStorageProfileInput): Promise<UseCaseResult<StorageProfile>> {
    return this.storageProfileRegistry.registerStorageProfile(input).then(useCaseResult);
  }
}

export class GetStorageProfileUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(storageProfileId: string): Promise<UseCaseResult<StorageProfile | null>> {
    return this.storageProfileRegistry.getStorageProfile(storageProfileId).then(useCaseResult);
  }
}

export class ListStorageProfilesUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListStorageProfilesResult>> {
    return this.storageProfileRegistry.listStorageProfiles().then(useCaseResult);
  }
}

export class UpdateStorageProfileUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(input: UpdateStorageProfileInput): Promise<UseCaseResult<StorageProfile>> {
    return this.storageProfileRegistry.updateStorageProfile(input).then(useCaseResult);
  }
}

export class DeleteStorageProfileUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(storageProfileId: string): Promise<UseCaseResult<DeleteStorageProfileResult>> {
    return this.storageProfileRegistry.deleteStorageProfile(storageProfileId).then(useCaseResult);
  }
}

export class FindStorageProfileByNameUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindStorageProfileByNameResult>> {
    return this.storageProfileRegistry.findStorageProfileByName(name).then(useCaseResult);
  }
}

export class ListStorageProfilesByCategoryUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListStorageProfilesByCategoryResult>> {
    return this.storageProfileRegistry.listStorageProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetStorageProfileRegistryStatisticsUseCase {
  constructor(private readonly storageProfileRegistry: AiStorageProfileRegistryService) {}

  execute(): Promise<UseCaseResult<StorageProfileRegistryStatistics>> {
    return this.storageProfileRegistry.getStorageProfileRegistryStatistics().then(useCaseResult);
  }
}
