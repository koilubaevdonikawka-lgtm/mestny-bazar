import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";

/** Registers developer platform metadata in the architecture documentation registry. */
export function activateDeveloperPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-developer",
      name: "Developer Platform",
      path: "server/platform/developer",
      components: [
        "DeveloperPlatform",
        "DeveloperCommandRunner",
        "ArchitectureAnalyzer",
        "ScaffoldingEngine",
      ],
      dependencies: [
        "platform-documentation",
        "platform-governance",
        "platform-testing",
        "platform-runtime",
        "platform-integration",
      ],
    }),
  });
}
