export {
  type FeatureCategory,
  type FeatureDescriptor,
  createFeatureDescriptor,
} from "./feature-descriptor.model";
export {
  type FeatureFlagKind,
  type FeatureFlag,
  createFeatureFlag,
} from "./feature-flag.model";
export {
  type FeatureEvaluation,
  createFeatureEvaluation,
} from "./feature-evaluation.model";
export {
  type RolloutStrategy,
  type RolloutPlan,
  createRolloutPlan,
} from "./rollout-plan.model";
export {
  type ExperimentKind,
  type ExperimentDescriptor,
  createExperimentDescriptor,
} from "./experiment-descriptor.model";

export interface TargetingContext {
  readonly environment: string;
  readonly platform: string;
  readonly providers: readonly string[];
  readonly sdkClients: readonly string[];
  readonly apiVersions: readonly string[];
}

export function createTargetingContext(input: {
  environment?: string;
  platform?: string;
  providers?: readonly string[];
  sdkClients?: readonly string[];
  apiVersions?: readonly string[];
}): TargetingContext {
  return Object.freeze({
    environment: input.environment?.trim() || "development",
    platform: input.platform?.trim() || "platform-features",
    providers: Object.freeze([...(input.providers ?? [])]),
    sdkClients: Object.freeze([...(input.sdkClients ?? [])]),
    apiVersions: Object.freeze([...(input.apiVersions ?? [])]),
  });
}
