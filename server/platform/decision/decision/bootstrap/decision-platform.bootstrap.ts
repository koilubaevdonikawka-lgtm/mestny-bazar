import { ArchitectureIntelligenceTokens } from "@server/platform/architecture-intelligence/architecture-intelligence/tokens";
import { CapabilityTokens } from "@server/platform/capabilities/capabilities/tokens";
import { ComplianceTokens } from "@server/platform/compliance/compliance/tokens";
import { IntegrationTokens } from "@server/platform/integration/integration/tokens";
import { KnowledgeTokens } from "@server/platform/knowledge/knowledge/tokens";
import { PolicyTokens } from "@server/platform/policy/policy/tokens";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import type { ArchitectureIntelligencePlatform } from "@server/platform/architecture-intelligence/architecture-intelligence/architecture-intelligence-platform";
import type { KnowledgePlatform } from "@server/platform/knowledge/knowledge/knowledge-platform";
import type { PolicyPlatform } from "@server/platform/policy/policy/policy-platform";
import type { CompliancePlatform } from "@server/platform/compliance/compliance/compliance-platform";
import type { CapabilityPlatform } from "@server/platform/capabilities/capabilities/capability-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import {
  ConfidenceEngine,
  DecisionEngine,
  DecisionEvaluator,
  DecisionManager,
  DecisionPlatform,
  DecisionRegistry,
  DecisionStrategyRegistry,
  DecisionTokens,
  ReasoningEngine,
} from "@server/platform/decision/decision";

/** Registers decision platform services in the DI container. */
export function registerDecisionPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(DecisionTokens.DecisionRegistry, () => new DecisionRegistry());
  registry.registerSingleton(DecisionTokens.DecisionStrategyRegistry, () => new DecisionStrategyRegistry());
  registry.registerSingleton(DecisionTokens.ReasoningEngine, () => new ReasoningEngine());
  registry.registerSingleton(DecisionTokens.ConfidenceEngine, () => new ConfidenceEngine());

  registry.registerSingleton(
    DecisionTokens.DecisionEngine,
    (provider) =>
      new DecisionEngine(
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<KnowledgePlatform>(KnowledgeTokens.KnowledgePlatform),
        provider.resolve<PolicyPlatform>(PolicyTokens.PolicyPlatform),
        provider.resolve<CompliancePlatform>(ComplianceTokens.CompliancePlatform),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
        provider.resolve<ProviderRegistry>(IntegrationTokens.ProviderRegistry),
      ),
  );

  registry.registerSingleton(
    DecisionTokens.DecisionEvaluator,
    (provider) =>
      new DecisionEvaluator(
        provider.resolve<PolicyPlatform>(PolicyTokens.PolicyPlatform),
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
        provider.resolve<CapabilityPlatform>(CapabilityTokens.CapabilityPlatform),
      ),
  );

  registry.registerSingleton(
    DecisionTokens.DecisionManager,
    (provider) =>
      new DecisionManager(
        provider.resolve(DecisionTokens.DecisionRegistry),
        provider.resolve(DecisionTokens.DecisionEngine),
        provider.resolve(DecisionTokens.DecisionEvaluator),
        provider.resolve(DecisionTokens.DecisionStrategyRegistry),
        provider.resolve(DecisionTokens.ReasoningEngine),
        provider.resolve(DecisionTokens.ConfidenceEngine),
        provider.resolve<ArchitectureIntelligencePlatform>(
          ArchitectureIntelligenceTokens.ArchitectureIntelligencePlatform,
        ),
      ),
  );

  registry.registerSingleton(DecisionTokens.DecisionPlatform, (provider) =>
    new DecisionPlatform(provider.resolve(DecisionTokens.DecisionManager)),
  );
}
