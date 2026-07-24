import type {
  RegisterFeatureFlagInput,
  UpdateFeatureFlagInput,
} from "@server/application/feature-flag-management/models/feature-flag.model";
import {
  DeleteFeatureFlagUseCase,
  DisableFeatureFlagUseCase,
  EnableFeatureFlagUseCase,
  GetFeatureFlagStatusUseCase,
  GetFeatureFlagUseCase,
  ListFeatureFlagsUseCase,
  RegisterFeatureFlagUseCase,
  UpdateFeatureFlagUseCase,
} from "@server/application/feature-flag-management/use-cases/feature-flag-management.use-cases";

/** Application facade for feature flag management scenario. */
export class FeatureFlagManagementApplicationService {
  constructor(
    private readonly registerFeatureFlagUseCase: RegisterFeatureFlagUseCase,
    private readonly getFeatureFlagUseCase: GetFeatureFlagUseCase,
    private readonly enableFeatureFlagUseCase: EnableFeatureFlagUseCase,
    private readonly disableFeatureFlagUseCase: DisableFeatureFlagUseCase,
    private readonly updateFeatureFlagUseCase: UpdateFeatureFlagUseCase,
    private readonly deleteFeatureFlagUseCase: DeleteFeatureFlagUseCase,
    private readonly listFeatureFlagsUseCase: ListFeatureFlagsUseCase,
    private readonly getFeatureFlagStatusUseCase: GetFeatureFlagStatusUseCase,
  ) {}

  registerFeatureFlag(input: RegisterFeatureFlagInput) {
    return this.registerFeatureFlagUseCase.execute(input);
  }

  getFeatureFlag(key: string) {
    return this.getFeatureFlagUseCase.execute(key);
  }

  enableFeatureFlag(key: string) {
    return this.enableFeatureFlagUseCase.execute(key);
  }

  disableFeatureFlag(key: string) {
    return this.disableFeatureFlagUseCase.execute(key);
  }

  updateFeatureFlag(input: UpdateFeatureFlagInput) {
    return this.updateFeatureFlagUseCase.execute(input);
  }

  deleteFeatureFlag(key: string) {
    return this.deleteFeatureFlagUseCase.execute(key);
  }

  listFeatureFlags() {
    return this.listFeatureFlagsUseCase.execute();
  }

  getFeatureFlagStatus(key: string) {
    return this.getFeatureFlagStatusUseCase.execute(key);
  }
}
