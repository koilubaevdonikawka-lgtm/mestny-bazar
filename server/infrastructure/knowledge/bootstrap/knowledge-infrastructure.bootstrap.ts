import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createKnowledgeNode,
  KnowledgeTokens,
  type KnowledgePlatform,
} from "@server/platform/knowledge/knowledge";

/** Activates knowledge platform metadata and default knowledge graph. */
export function activateKnowledgePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-knowledge",
      name: "Knowledge Platform",
      path: "server/platform/knowledge",
      components: [
        "KnowledgePlatform",
        "KnowledgeManager",
        "KnowledgeRegistry",
        "KnowledgeGraphEngine",
        "RelationRegistry",
        "KnowledgeDiscoveryEngine",
        "KnowledgeQueryEngine",
      ],
      dependencies: [
        "platform-documentation",
        "platform-capabilities",
        "platform-gateway",
        "platform-sdk",
        "platform-lifecycle",
        "platform-integration",
      ],
    }),
  });

  const knowledgePlatform = provider.resolve<KnowledgePlatform>(
    KnowledgeTokens.KnowledgePlatform,
  );

  knowledgePlatform.registerNode(
    createKnowledgeNode({
      id: "knowledge-platform-core",
      name: "Knowledge Platform Core",
      kind: "platform",
      description: "Central platform knowledge graph registry",
    }),
  );

  knowledgePlatform.discoverKnowledge();
  knowledgePlatform.generateGraph();
}
