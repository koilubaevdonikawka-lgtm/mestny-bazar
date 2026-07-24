import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createExperimentDescriptor,
  createFeatureDescriptor,
  createFeatureFlag,
  createRolloutPlan,
  FeatureTokens,
  type ExperimentRegistry,
  type FeatureFlagEngine,
  type FeaturePlatform,
} from "@server/platform/features/features";

/** Activates feature platform metadata and default feature catalog. */
export function activateFeaturePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-features",
      name: "Feature Platform",
      path: "server/platform/features",
      components: [
        "FeaturePlatform",
        "FeatureManager",
        "FeatureRegistry",
        "FeatureFlagEngine",
        "TargetingEngine",
        "RolloutManager",
        "ExperimentRegistry",
      ],
      dependencies: [
        "platform-runtime",
        "platform-gateway",
        "platform-sdk",
        "platform-documentation",
        "platform-governance",
        "platform-integration",
      ],
    }),
  });

  const featurePlatform = provider.resolve<FeaturePlatform>(FeatureTokens.FeaturePlatform);
  const flagEngine = provider.resolve<FeatureFlagEngine>(FeatureTokens.FeatureFlagEngine);
  const experimentRegistry = provider.resolve<ExperimentRegistry>(FeatureTokens.ExperimentRegistry);

  const platformFeature = featurePlatform.registerFeature(
    createFeatureDescriptor({
      id: "feature-platform-core",
      name: "Platform Core Features",
      category: "platform",
      description: "Core platform feature management capabilities",
      enabled: true,
    }),
  );

  featurePlatform.registerFeature(
    createFeatureDescriptor({
      id: "feature-gateway-v2",
      name: "Gateway V2 Endpoints",
      category: "beta",
      description: "Beta gateway endpoint routing",
    }),
  );

  featurePlatform.registerFeature(
    createFeatureDescriptor({
      id: "feature-sdk-codegen",
      name: "SDK Code Generation",
      category: "experimental",
      description: "Experimental SDK generation pipeline",
    }),
  );

  featurePlatform.registerFeature(
    createFeatureDescriptor({
      id: "feature-internal-diagnostics",
      name: "Internal Diagnostics",
      category: "internal",
      description: "Internal platform diagnostics overlay",
    }),
  );

  featurePlatform.registerFeature(
    createFeatureDescriptor({
      id: "feature-legacy-api",
      name: "Legacy API Compatibility",
      category: "deprecated",
      description: "Deprecated legacy API compatibility layer",
    }),
  );

  flagEngine.registerFlag(
    createFeatureFlag({
      featureId: platformFeature.id,
      kind: "platform",
      value: "platform-features",
    }),
  );

  flagEngine.registerFlag(
    createFeatureFlag({
      featureId: "feature-gateway-v2",
      kind: "percentage",
      value: 25,
    }),
  );

  experimentRegistry.register(
    createExperimentDescriptor({
      id: "experiment-gateway-canary",
      name: "Gateway Canary Rollout",
      kind: "canary",
      featureIds: ["feature-gateway-v2"],
      active: true,
    }),
  );

  experimentRegistry.register(
    createExperimentDescriptor({
      id: "experiment-sdk-ab",
      name: "SDK Generation A/B",
      kind: "a-b",
      featureIds: ["feature-sdk-codegen"],
    }),
  );

  featurePlatform.planRollout(
    createRolloutPlan({
      featureId: "feature-gateway-v2",
      strategy: "percentage",
      percentage: 25,
      metadata: Object.freeze({ phase: "canary" }),
    }),
  );
}
