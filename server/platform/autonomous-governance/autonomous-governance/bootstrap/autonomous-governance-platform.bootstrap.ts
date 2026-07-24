import { ArchitectureIntelligenceTokens } from "@server/platform/architecture-intelligence/architecture-intelligence/tokens";
import { CapabilityTokens } from "@server/platform/capabilities/capabilities/tokens";
import { ComplianceTokens } from "@server/platform/compliance/compliance/tokens";
import { DecisionTokens } from "@server/platform/decision/decision/tokens";
import { DigitalTwinTokens } from "@server/platform/digital-twin/digital-twin/tokens";
import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { KnowledgeTokens } from "@server/platform/knowledge/knowledge/tokens";
import { LifecycleTokens } from "@server/platform/lifecycle/lifecycle/tokens";
import { PolicyTokens } from "@server/platform/policy/policy/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { DecisionPlatform } from "@server/platform/decision/decision/decision-platform";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { LifecyclePlatform } from "@server/platform/lifecycle/lifecycle/lifecycle-platform";
import type { DigitalTwinPlatform } from "@server/platform/digital-twin/digital-twin/digital-twin-platform";
import {
  AutonomousGovernanceManager,
  AutonomousGovernancePlatform,
  AutonomousGovernanceRegistry,
  AutonomousGovernanceTokens,
  GovernanceHealthEngine,
  GovernancePlanningEngine,
  GovernanceRecommendationEngine,
  PlatformCoordinationEngine,
  PlatformMonitoringEngine,
} from "@server/platform/autonomous-governance/autonomous-governance";

/** Registers autonomous governance platform services in the DI container. */
export function registerAutonomousGovernancePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(
    AutonomousGovernanceTokens.AutonomousGovernanceRegistry,
    () => new AutonomousGovernanceRegistry(),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.PlatformMonitoringEngine,
    (provider) =>
      new PlatformMonitoringEngine(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
        provider.resolve<DecisionPlatform>(DecisionTokens.DecisionPlatform),
      ),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.GovernancePlanningEngine,
    (provider) =>
      new GovernancePlanningEngine(
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<DecisionPlatform>(DecisionTokens.DecisionPlatform),
      ),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.PlatformCoordinationEngine,
    (provider) =>
      new PlatformCoordinationEngine(
        provider.resolve<PolicyPlatform>(PolicyTokens.PolicyPlatform),
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
        provider.resolve<DecisionPlatform>(DecisionTokens.DecisionPlatform),
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<LifecyclePlatform>(LifecycleTokens.LifecyclePlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<DigitalTwinPlatform>(DigitalTwinTokens.DigitalTwinPlatform),
      ),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.GovernanceRecommendationEngine,
    (provider) =>
      new GovernanceRecommendationEngine(
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<DecisionPlatform>(DecisionTokens.DecisionPlatform),
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
      ),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.GovernanceHealthEngine,
    (provider) =>
      new GovernanceHealthEngine(
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
        provider.resolve<PolicyPlatform>(PolicyTokens.PolicyPlatform),
        provider.resolve<LifecyclePlatform>(LifecycleTokens.LifecyclePlatform),
      ),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.AutonomousGovernanceManager,
    (provider) =>
      new AutonomousGovernanceManager(
        provider.resolve(AutonomousGovernanceTokens.AutonomousGovernanceRegistry),
        provider.resolve(AutonomousGovernanceTokens.PlatformMonitoringEngine),
        provider.resolve(AutonomousGovernanceTokens.GovernancePlanningEngine),
        provider.resolve(AutonomousGovernanceTokens.PlatformCoordinationEngine),
        provider.resolve(AutonomousGovernanceTokens.GovernanceRecommendationEngine),
        provider.resolve(AutonomousGovernanceTokens.GovernanceHealthEngine),
      ),
  );

  registry.registerSingleton(
    AutonomousGovernanceTokens.AutonomousGovernancePlatform,
    (provider) =>
      new AutonomousGovernancePlatform(
        provider.resolve(AutonomousGovernanceTokens.AutonomousGovernanceManager),
      ),
  );
}
