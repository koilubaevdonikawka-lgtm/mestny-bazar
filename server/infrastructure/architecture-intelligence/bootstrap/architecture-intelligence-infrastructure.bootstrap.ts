import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  ArchitectureIntelligenceTokens,
  type ArchitectureIntelligencePlatform,
} from "@server/platform/architecture-intelligence/architecture-intelligence";

/** Activates architecture intelligence platform metadata and default analysis. */
export function activateArchitectureIntelligencePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-architecture-intelligence",
      name: "Architecture Intelligence Platform",
      path: "server/platform/architecture-intelligence",
      components: [
        "ArchitectureIntelligencePlatform",
        "ArchitectureIntelligenceManager",
        "ArchitectureIntelligenceRegistry",
        "ArchitectureAnalyzer",
        "ArchitectureRiskEngine",
        "RecommendationEngine",
        "ArchitectureForecastEngine",
        "ArchitectureScoringEngine",
      ],
      dependencies: [
        "platform-knowledge",
        "platform-digital-twin",
        "platform-capabilities",
        "platform-documentation",
        "platform-compliance",
        "platform-integration",
      ],
    }),
  });

  const intelligencePlatform = provider.resolve<ArchitectureIntelligencePlatform>(
    ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
  );

  intelligencePlatform.analyzeArchitecture();
  intelligencePlatform.detectRisks();
  intelligencePlatform.generateRecommendations();
  intelligencePlatform.forecastChanges("growth");
  intelligencePlatform.calculateArchitectureScore();
}
