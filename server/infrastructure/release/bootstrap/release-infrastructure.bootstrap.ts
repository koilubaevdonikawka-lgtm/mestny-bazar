import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";

/** Registers release platform metadata in the architecture documentation registry. */
export function activateReleasePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-release",
      name: "Release Platform",
      path: "server/platform/release",
      components: [
        "ReleasePlatform",
        "ReleaseManager",
        "VersionManager",
        "ChangelogGenerator",
        "ReleaseManifestGenerator",
        "ReleasePackager",
        "ReleasePublisher",
      ],
      dependencies: [
        "platform-documentation",
        "platform-governance",
        "platform-testing",
        "platform-operations",
        "platform-runtime",
        "platform-integration",
      ],
    }),
  });
}
