import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  AutonomousGovernanceTokens,
  type AutonomousGovernancePlatform,
} from "@server/platform/autonomous-governance/autonomous-governance";

/** Activates autonomous governance platform metadata and default governance cycle. */
export function activateAutonomousGovernancePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-autonomous-governance",
      name: "Autonomous Governance Platform",
      path: "server/platform/autonomous-governance",
      components: [
        "AutonomousGovernancePlatform",
        "AutonomousGovernanceManager",
        "AutonomousGovernanceRegistry",
        "PlatformMonitoringEngine",
        "GovernancePlanningEngine",
        "PlatformCoordinationEngine",
        "GovernanceRecommendationEngine",
        "GovernanceHealthEngine",
      ],
      dependencies: [
        "platform-decision",
        "platform-architecture-intelligence",
        "platform-knowledge",
        "platform-capabilities",
        "platform-lifecycle",
        "platform-policy",
        "platform-compliance",
        "platform-digital-twin",
        "platform-documentation",
        "platform-integration",
      ],
    }),
  });

  const governancePlatform = provider.resolve<AutonomousGovernancePlatform>(
    AutonomousGovernanceTokens.AutonomousGovernancePlatform,
  );

  governancePlatform.evaluatePlatform();
  governancePlatform.coordinatePlatforms();
  governancePlatform.generatePlan("governance");
  governancePlatform.generateRecommendations();
  governancePlatform.generateGovernanceReport();
}
