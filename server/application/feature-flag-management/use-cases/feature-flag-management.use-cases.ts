import type {
  FeatureFlag,
  FeatureFlagStatus,
  ListFeatureFlagsResult,
  RegisterFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@server/application/feature-flag-management/models/feature-flag.model";
import type { FeatureFlagManagementService } from "@server/application/feature-flag-management/services/feature-flag-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterFeatureFlagUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(input: RegisterFeatureFlagInput): Promise<UseCaseResult<FeatureFlag>> {
    return this.flags.registerFeatureFlag(input).then(useCaseResult);
  }
}

export class GetFeatureFlagUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(key: string): Promise<UseCaseResult<FeatureFlag | null>> {
    return this.flags.getFeatureFlag(key).then(useCaseResult);
  }
}

export class EnableFeatureFlagUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(key: string): Promise<UseCaseResult<FeatureFlag>> {
    return this.flags.enableFeatureFlag(key).then(useCaseResult);
  }
}

export class DisableFeatureFlagUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(key: string): Promise<UseCaseResult<FeatureFlag>> {
    return this.flags.disableFeatureFlag(key).then(useCaseResult);
  }
}

export class UpdateFeatureFlagUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(input: UpdateFeatureFlagInput): Promise<UseCaseResult<FeatureFlag>> {
    return this.flags.updateFeatureFlag(input).then(useCaseResult);
  }
}

export class DeleteFeatureFlagUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(key: string): Promise<UseCaseResult<{ key: string; deleted: boolean }>> {
    return this.flags.deleteFeatureFlag(key).then(useCaseResult);
  }
}

export class ListFeatureFlagsUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(): Promise<UseCaseResult<ListFeatureFlagsResult>> {
    return this.flags.listFeatureFlags().then(useCaseResult);
  }
}

export class GetFeatureFlagStatusUseCase {
  constructor(private readonly flags: FeatureFlagManagementService) {}

  execute(key: string): Promise<UseCaseResult<FeatureFlagStatus>> {
    return this.flags.getFeatureFlagStatus(key).then(useCaseResult);
  }
}
