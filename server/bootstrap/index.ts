export {
  buildCompositionRoot,
  createApplicationContext,
  createServiceRegistry,
  type ApplicationContext,
  type CompositionRootConfig,
} from "./composition-root";
export {
  registerInfrastructure,
  type InfrastructureBootstrapConfig,
} from "./infrastructure-bootstrap";
export { registerApplication } from "./application-bootstrap";
export { registerApi } from "./api-bootstrap";
export { registerAIPlatform } from "@server/platform/ai/bootstrap/ai-platform.bootstrap";
export { registerIntegrationPlatform } from "@server/platform/integration/bootstrap/integration-platform.bootstrap";
export { registerRuntimePlatform } from "@server/platform/runtime/bootstrap/runtime-platform.bootstrap";
export { registerTestingPlatform } from "@server/platform/testing/testing/bootstrap/testing-platform.bootstrap";
export { registerDocumentationPlatform } from "@server/platform/documentation/documentation/bootstrap/documentation-platform.bootstrap";
export { registerGovernancePlatform } from "@server/platform/governance/governance/bootstrap/governance-platform.bootstrap";
export { registerDeveloperPlatform } from "@server/platform/developer/developer/bootstrap/developer-platform.bootstrap";
export { registerOperationsPlatform } from "@server/platform/operations/operations/bootstrap/operations-platform.bootstrap";
export { registerReleasePlatform } from "@server/platform/release/release/bootstrap/release-platform.bootstrap";
export { registerEvolutionPlatform } from "@server/platform/evolution/evolution/bootstrap/evolution-platform.bootstrap";
export { registerSDKPlatform } from "@server/platform/sdk/sdk/bootstrap/sdk-platform.bootstrap";
export { registerGatewayPlatform } from "@server/platform/gateway/gateway/bootstrap/gateway-platform.bootstrap";
export { registerObservabilityPlatform } from "@server/platform/observability/observability/bootstrap/observability-platform.bootstrap";
export { registerFeaturePlatform } from "@server/platform/features/features/bootstrap/feature-platform.bootstrap";
export { registerPolicyPlatform } from "@server/platform/policy/policy/bootstrap/policy-platform.bootstrap";
export { registerCompliancePlatform } from "@server/platform/compliance/compliance/bootstrap/compliance-platform.bootstrap";
export { registerLifecyclePlatform } from "@server/platform/lifecycle/lifecycle/bootstrap/lifecycle-platform.bootstrap";
export { registerCapabilityPlatform } from "@server/platform/capabilities/capabilities/bootstrap/capability-platform.bootstrap";
export { registerKnowledgePlatform } from "@server/platform/knowledge/knowledge/bootstrap/knowledge-platform.bootstrap";
export { registerDigitalTwinPlatform } from "@server/platform/digital-twin/digital-twin/bootstrap/digital-twin-platform.bootstrap";
export { registerArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/bootstrap/architecture-intelligence-platform.bootstrap";
export { registerDecisionPlatform } from "@server/platform/decision/decision/bootstrap/decision-platform.bootstrap";
export { registerAutonomousGovernancePlatform } from "@server/platform/autonomous-governance/autonomous-governance/bootstrap/autonomous-governance-platform.bootstrap";
export { activateDocumentationRegistry } from "@server/infrastructure/documentation/bootstrap";
export { activateGovernancePolicies } from "@server/infrastructure/governance/bootstrap";
export { activateDeveloperPlatform } from "@server/infrastructure/developer/bootstrap";
export { activateOperationsPlatform } from "@server/infrastructure/operations/bootstrap";
export { activateReleasePlatform } from "@server/infrastructure/release/bootstrap";
export { activateEvolutionPlatform } from "@server/infrastructure/evolution/bootstrap";
export { activateSDKPlatform } from "@server/infrastructure/sdk/bootstrap";
export { activateGatewayPlatform } from "@server/infrastructure/gateway/bootstrap";
export { activateObservabilityPlatform } from "@server/infrastructure/observability/bootstrap";
export { activateFeaturePlatform } from "@server/infrastructure/features/bootstrap";
export { activatePolicyPlatform } from "@server/infrastructure/policy/bootstrap";
export { activateCompliancePlatform } from "@server/infrastructure/compliance/bootstrap";
export { activateLifecyclePlatform } from "@server/infrastructure/lifecycle/bootstrap";
export { activateCapabilityPlatform } from "@server/infrastructure/capabilities/bootstrap";
export { activateKnowledgePlatform } from "@server/infrastructure/knowledge/bootstrap";
export { activateDigitalTwinPlatform } from "@server/infrastructure/digital-twin/bootstrap";
export { activateArchitectureIntelligencePlatform } from "@server/infrastructure/architecture-intelligence/bootstrap";
export { activateDecisionPlatform } from "@server/infrastructure/decision/bootstrap";
export { activateAutonomousGovernancePlatform } from "@server/infrastructure/autonomous-governance/bootstrap";
export { activateIntegrationProviders } from "@server/infrastructure/integration/bootstrap";
export { LifecycleManager, type LifecycleDependencies, type LifecycleState } from "./lifecycle-manager";
export { StartupValidator, type StartupValidationResult } from "./startup-validator";
export {
  HealthCheck,
  type ComponentHealth,
  type HealthCheckReport,
  type HealthStatus,
} from "./health-check";
export { BootstrapTokens, type BootstrapToken } from "./tokens";
export { getApplicationProvider, resetApplicationProvider } from "./application-provider";
