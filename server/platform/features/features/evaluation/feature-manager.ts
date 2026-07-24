import type { IFeatureManager } from "@server/platform/features/features/contracts";
import type { IFeatureRegistry } from "@server/platform/features/features/contracts";
import type { IFeatureFlagEngine } from "@server/platform/features/features/contracts";
import type { ITargetingEngine } from "@server/platform/features/features/contracts";
import {
  createFeatureDescriptor,
  createFeatureEvaluation,
  type FeatureDescriptor,
  type FeatureEvaluation,
} from "@server/platform/features/features/models";
import {
  createFeatureDisabledEvent,
  createFeatureEnabledEvent,
  createFeatureEvaluatedEvent,
} from "@server/platform/features/features/events";

/** Orchestrates feature registration, evaluation and lifecycle. */
export class FeatureManager implements IFeatureManager {
  constructor(
    private readonly registry: IFeatureRegistry,
    private readonly flagEngine: IFeatureFlagEngine,
    private readonly targetingEngine: ITargetingEngine,
  ) {}

  registerFeature(feature: FeatureDescriptor): FeatureDescriptor {
    return this.registry.register(feature);
  }

  enableFeature(featureId: string): FeatureDescriptor {
    const existing = this.requireFeature(featureId);
    const enabled = createFeatureDescriptor({
      ...existing,
      enabled: true,
      updatedAt: new Date().toISOString(),
    });
    const stored = this.registry.update(enabled);
    createFeatureEnabledEvent(stored);
    return stored;
  }

  disableFeature(featureId: string): FeatureDescriptor {
    const existing = this.requireFeature(featureId);
    const disabled = createFeatureDescriptor({
      ...existing,
      enabled: false,
      updatedAt: new Date().toISOString(),
    });
    const stored = this.registry.update(disabled);
    createFeatureDisabledEvent(stored);
    return stored;
  }

  evaluateFeature(featureId: string): FeatureEvaluation {
    const feature = this.requireFeature(featureId);
    const context = this.targetingEngine.buildContext();
    const contextRecord = Object.freeze({
      environment: context.environment,
      platform: context.platform,
      providerCount: context.providers.length,
      sdkClientCount: context.sdkClients.length,
      apiVersionCount: context.apiVersions.length,
    });

    if (!feature.enabled) {
      const evaluation = createFeatureEvaluation({
        featureId: feature.id,
        featureName: feature.name,
        enabled: false,
        reason: "feature-disabled",
        context: contextRecord,
      });
      createFeatureEvaluatedEvent(evaluation);
      return evaluation;
    }

    const flags = this.flagEngine.listFlags(feature.id);
    if (flags.length === 0) {
      const evaluation = createFeatureEvaluation({
        featureId: feature.id,
        featureName: feature.name,
        enabled: true,
        reason: "no-flags-default-enabled",
        context: contextRecord,
      });
      createFeatureEvaluatedEvent(evaluation);
      return evaluation;
    }

    const enabled = flags.every((flag) => this.flagEngine.evaluateFlag(flag, context));
    const evaluation = createFeatureEvaluation({
      featureId: feature.id,
      featureName: feature.name,
      enabled,
      reason: enabled ? "flags-passed" : "flags-rejected",
      context: contextRecord,
    });
    createFeatureEvaluatedEvent(evaluation);
    return evaluation;
  }

  listFeatures(category?: FeatureDescriptor["category"]): readonly FeatureDescriptor[] {
    return this.registry.list(category);
  }

  private requireFeature(featureId: string): FeatureDescriptor {
    const feature = this.registry.get(featureId);
    if (!feature) {
      throw new Error(`Feature not found: ${featureId}`);
    }
    return feature;
  }
}
