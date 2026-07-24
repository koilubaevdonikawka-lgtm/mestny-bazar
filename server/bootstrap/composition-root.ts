import { registerApi } from "@server/bootstrap/api-bootstrap";
import { registerApplication } from "@server/bootstrap/application-bootstrap";
import { HealthCheck } from "@server/bootstrap/health-check";
import {
  registerInfrastructure,
  type InfrastructureBootstrapConfig,
} from "@server/bootstrap/infrastructure-bootstrap";
import { LifecycleManager } from "@server/bootstrap/lifecycle-manager";
import { StartupValidator } from "@server/bootstrap/startup-validator";
import { BootstrapTokens } from "@server/bootstrap/tokens";
import { activateAnalyticsEventSubscriptions } from "@server/infrastructure/analytics/bootstrap/analytics-event-wiring.bootstrap";
import { registerAIPlatform } from "@server/platform/ai/bootstrap/ai-platform.bootstrap";
import { registerIntegrationPlatform } from "@server/platform/integration/bootstrap/integration-platform.bootstrap";
import { registerRuntimePlatform } from "@server/platform/runtime/bootstrap/runtime-platform.bootstrap";
import { registerTestingPlatform } from "@server/platform/testing/testing/bootstrap/testing-platform.bootstrap";
import { registerDocumentationPlatform } from "@server/platform/documentation/documentation/bootstrap/documentation-platform.bootstrap";
import { registerGovernancePlatform } from "@server/platform/governance/governance/bootstrap/governance-platform.bootstrap";
import { registerDeveloperPlatform } from "@server/platform/developer/developer/bootstrap/developer-platform.bootstrap";
import { registerOperationsPlatform } from "@server/platform/operations/operations/bootstrap/operations-platform.bootstrap";
import { registerReleasePlatform } from "@server/platform/release/release/bootstrap/release-platform.bootstrap";
import { registerEvolutionPlatform } from "@server/platform/evolution/evolution/bootstrap/evolution-platform.bootstrap";
import { registerSDKPlatform } from "@server/platform/sdk/sdk/bootstrap/sdk-platform.bootstrap";
import { registerGatewayPlatform } from "@server/platform/gateway/gateway/bootstrap/gateway-platform.bootstrap";
import { registerObservabilityPlatform } from "@server/platform/observability/observability/bootstrap/observability-platform.bootstrap";
import { registerFeaturePlatform } from "@server/platform/features/features/bootstrap/feature-platform.bootstrap";
import { registerPolicyPlatform } from "@server/platform/policy/policy/bootstrap/policy-platform.bootstrap";
import { registerCompliancePlatform } from "@server/platform/compliance/compliance/bootstrap/compliance-platform.bootstrap";
import { registerLifecyclePlatform } from "@server/platform/lifecycle/lifecycle/bootstrap/lifecycle-platform.bootstrap";
import { registerCapabilityPlatform } from "@server/platform/capabilities/capabilities/bootstrap/capability-platform.bootstrap";
import { registerKnowledgePlatform } from "@server/platform/knowledge/knowledge/bootstrap/knowledge-platform.bootstrap";
import { registerDigitalTwinPlatform } from "@server/platform/digital-twin/digital-twin/bootstrap/digital-twin-platform.bootstrap";
import { registerArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/bootstrap/architecture-intelligence-platform.bootstrap";
import { registerDecisionPlatform } from "@server/platform/decision/decision/bootstrap/decision-platform.bootstrap";
import { registerAutonomousGovernancePlatform } from "@server/platform/autonomous-governance/autonomous-governance/bootstrap/autonomous-governance-platform.bootstrap";
import { activateIntegrationProviders } from "@server/infrastructure/integration/bootstrap";
import { activateDocumentationRegistry } from "@server/infrastructure/documentation/bootstrap";
import { activateGovernancePolicies } from "@server/infrastructure/governance/bootstrap";
import { activateDeveloperPlatform } from "@server/infrastructure/developer/bootstrap";
import { activateOperationsPlatform } from "@server/infrastructure/operations/bootstrap";
import { activateReleasePlatform } from "@server/infrastructure/release/bootstrap";
import { activateEvolutionPlatform } from "@server/infrastructure/evolution/bootstrap";
import { activateSDKPlatform } from "@server/infrastructure/sdk/bootstrap";
import { activateGatewayPlatform } from "@server/infrastructure/gateway/bootstrap";
import { activateObservabilityPlatform } from "@server/infrastructure/observability/bootstrap";
import { activateFeaturePlatform } from "@server/infrastructure/features/bootstrap";
import { activatePolicyPlatform } from "@server/infrastructure/policy/bootstrap";
import { activateCompliancePlatform } from "@server/infrastructure/compliance/bootstrap";
import { activateLifecyclePlatform } from "@server/infrastructure/lifecycle/bootstrap";
import { activateCapabilityPlatform } from "@server/infrastructure/capabilities/bootstrap";
import { activateKnowledgePlatform } from "@server/infrastructure/knowledge/bootstrap";
import { activateDigitalTwinPlatform } from "@server/infrastructure/digital-twin/bootstrap";
import { activateArchitectureIntelligencePlatform } from "@server/infrastructure/architecture-intelligence/bootstrap";
import { activateDecisionPlatform } from "@server/infrastructure/decision/bootstrap";
import { activateAutonomousGovernancePlatform } from "@server/infrastructure/autonomous-governance/bootstrap";
import {
  RuntimeTokens,
  type ApplicationLifecycle,
  type HealthService,
} from "@server/platform/runtime/runtime";
import type { ApiServer } from "@server/api/server/api-server";
import {
  ServiceProvider,
  ServiceRegistry,
} from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import type { ConfigurationProvider } from "@server/infrastructure/configuration";

/** Fully assembled application runtime context. */
export interface ApplicationContext {
  readonly provider: ServiceProvider;
  readonly apiServer: ApiServer;
  readonly configuration: ConfigurationProvider;
  readonly lifecycle: LifecycleManager;
  readonly healthCheck: HealthCheck;
  readonly runtimeLifecycle: ApplicationLifecycle;
  readonly runtimeHealth: HealthService;
}

export type CompositionRootConfig = InfrastructureBootstrapConfig;

/** Builds the service registry without creating runtime instances. */
export function createServiceRegistry(config: CompositionRootConfig = {}): ServiceRegistry {
  const registry = new ServiceRegistry();
  registerInfrastructure(registry, config);
  registerApplication(registry);
  registerAIPlatform(registry);
  registerIntegrationPlatform(registry);
  registerApi(registry);
  registerRuntimePlatform(registry);
  registerTestingPlatform(registry);
  registerDocumentationPlatform(registry);
  registerGovernancePlatform(registry);
  registerDeveloperPlatform(registry);
  registerOperationsPlatform(registry);
  registerReleasePlatform(registry);
  registerEvolutionPlatform(registry);
  registerSDKPlatform(registry);
  registerGatewayPlatform(registry);
  registerObservabilityPlatform(registry);
  registerFeaturePlatform(registry);
  registerPolicyPlatform(registry);
  registerCompliancePlatform(registry);
  registerLifecyclePlatform(registry);
  registerCapabilityPlatform(registry);
  registerKnowledgePlatform(registry);
  registerDigitalTwinPlatform(registry);
  registerArchitectureIntelligencePlatform(registry);
  registerDecisionPlatform(registry);
  registerAutonomousGovernancePlatform(registry);
  return registry;
}

/**
 * Composition Root — the single assembly point for the marketplace application.
 * Registers infrastructure, application, and API layers; wires DI; returns a ready context.
 */
export function buildCompositionRoot(config: CompositionRootConfig = {}): ApplicationContext {
  const registry = createServiceRegistry(config);
  const provider = new ServiceProvider(registry);
  activateIntegrationProviders(provider);
  activateAnalyticsEventSubscriptions(provider);
  activateDocumentationRegistry(provider);
  activateGovernancePolicies(provider);
  activateDeveloperPlatform(provider);
  activateOperationsPlatform(provider);
  activateReleasePlatform(provider);
  activateEvolutionPlatform(provider);
  activateSDKPlatform(provider);
  activateGatewayPlatform(provider);
  activateObservabilityPlatform(provider);
  activateFeaturePlatform(provider);
  activatePolicyPlatform(provider);
  activateCompliancePlatform(provider);
  activateLifecyclePlatform(provider);
  activateCapabilityPlatform(provider);
  activateKnowledgePlatform(provider);
  activateDigitalTwinPlatform(provider);
  activateArchitectureIntelligencePlatform(provider);
  activateDecisionPlatform(provider);
  activateAutonomousGovernancePlatform(provider);

  const configuration = provider.resolve<ConfigurationProvider>(InfrastructureTokens.Configuration);
  const apiServer = provider.resolve<ApiServer>(BootstrapTokens.ApiServer);
  const startupValidator = new StartupValidator(registry);
  const healthCheck = new HealthCheck(provider);

  const lifecycle = new LifecycleManager({
    provider,
    apiServer,
    configuration,
    healthCheck,
    startupValidator,
  });

  const runtimeLifecycle = provider.resolve<ApplicationLifecycle>(
    RuntimeTokens.ApplicationLifecycle,
  );
  const runtimeHealth = provider.resolve<HealthService>(RuntimeTokens.HealthService);

  return Object.freeze({
    provider,
    apiServer,
    configuration,
    lifecycle,
    healthCheck,
    runtimeLifecycle,
    runtimeHealth,
  });
}

/** Alias for buildCompositionRoot — creates a fully wired application context. */
export const createApplicationContext = buildCompositionRoot;
