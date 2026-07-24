import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createDecisionDescriptor,
  DecisionTokens,
  type DecisionPlatform,
} from "@server/platform/decision/decision";

/** Activates decision platform metadata and default decision catalog. */
export function activateDecisionPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-decision",
      name: "Decision Platform",
      path: "server/platform/decision",
      components: [
        "DecisionPlatform",
        "DecisionManager",
        "DecisionRegistry",
        "DecisionEngine",
        "DecisionEvaluator",
        "DecisionStrategyRegistry",
        "ReasoningEngine",
        "ConfidenceEngine",
      ],
      dependencies: [
        "platform-architecture-intelligence",
        "platform-knowledge",
        "platform-policy",
        "platform-compliance",
        "platform-capabilities",
        "platform-integration",
      ],
    }),
  });

  const decisionPlatform = provider.resolve<DecisionPlatform>(DecisionTokens.DecisionPlatform);

  const architectureDecision = decisionPlatform.decide(
    createDecisionDescriptor({
      id: "decision-platform-architecture",
      kind: "architecture",
      subject: "Platform architecture evolution",
      strategy: "balanced",
    }),
  );

  decisionPlatform.explainDecision(architectureDecision.id);
  decisionPlatform.listDecisions("architecture");
}
