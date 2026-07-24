import { CapabilityTokens } from "@server/platform/capabilities/capabilities/tokens";
import { ComplianceTokens } from "@server/platform/compliance/compliance/tokens";
import { DigitalTwinTokens } from "@server/platform/digital-twin/digital-twin/tokens";
import { DocumentationTokens } from "@server/platform/documentation/documentation/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { KnowledgeTokens } from "@server/platform/knowledge/knowledge/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { DigitalTwinPlatform } from "@server/platform/digital-twin/digital-twin/digital-twin-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import {
  ArchitectureAnalyzer,
  ArchitectureForecastEngine,
  ArchitectureIntelligenceManager,
  ArchitectureIntelligencePlatform,
  ArchitectureIntelligenceRegistry,
  ArchitectureIntelligenceTokens,
  ArchitectureRiskEngine,
  ArchitectureScoringEngine,
  RecommendationEngine,
} from "@server/platform/architecture-intelligence/architecture-intelligence";

/** Registers architecture intelligence platform services in the DI container. */
export function registerArchitectureIntelligencePlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureIntelligenceRegistry,
    () => new ArchitectureIntelligenceRegistry(),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureAnalyzer,
    (provider) =>
      new ArchitectureAnalyzer(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<DigitalTwinPlatform>(DigitalTwinTokens.DigitalTwinPlatform),
      ),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureRiskEngine,
    (provider) =>
      new ArchitectureRiskEngine(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.RecommendationEngine,
    () => new RecommendationEngine(),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureForecastEngine,
    (provider) =>
      new ArchitectureForecastEngine(
        provider.resolve<DocumentationPlatform>(DocumentationTokens.DocumentationPlatform),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<DigitalTwinPlatform>(DigitalTwinTokens.DigitalTwinPlatform),
      ),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureScoringEngine,
    (provider) =>
      new ArchitectureScoringEngine(
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
      ),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureIntelligenceManager,
    (provider) =>
      new ArchitectureIntelligenceManager(
        provider.resolve(ArchitectureIntelligenceTokens.ArchitectureIntelligenceRegistry),
        provider.resolve(ArchitectureIntelligenceTokens.ArchitectureAnalyzer),
        provider.resolve(ArchitectureIntelligenceTokens.ArchitectureRiskEngine),
        provider.resolve(ArchitectureIntelligenceTokens.RecommendationEngine),
        provider.resolve(ArchitectureIntelligenceTokens.ArchitectureForecastEngine),
        provider.resolve(ArchitectureIntelligenceTokens.ArchitectureScoringEngine),
      ),
  );

  registry.registerSingleton(
    ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
    (provider) =>
      new ArchitectureIntelligencePlatform(
        provider.resolve(ArchitectureIntelligenceTokens.ArchitectureIntelligenceManager),
      ),
  );
}
