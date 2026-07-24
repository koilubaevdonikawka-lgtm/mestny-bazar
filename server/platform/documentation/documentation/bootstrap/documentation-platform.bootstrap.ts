import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import {
  ArchitectureRegistry,
  ArchitectureSnapshotExporter,
  ArchitectureValidator,
  DocumentationGenerator,
  DocumentationPlatform,
  DocumentationTokens,
  JsonExporter,
  MarkdownExporter,
} from "@server/platform/documentation/documentation";

/** Registers documentation platform services. */
export function registerDocumentationPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(
    DocumentationTokens.ArchitectureRegistry,
    () => new ArchitectureRegistry(),
  );

  registry.registerSingleton(DocumentationTokens.DocumentationGenerator, (provider) =>
    new DocumentationGenerator(
      provider.resolve(DocumentationTokens.ArchitectureRegistry),
      registry,
    ),
  );

  registry.registerSingleton(DocumentationTokens.ArchitectureValidator, (provider) =>
    new ArchitectureValidator(provider.resolve(DocumentationTokens.ArchitectureRegistry)),
  );

  registry.registerSingleton(DocumentationTokens.MarkdownExporter, () => new MarkdownExporter());
  registry.registerSingleton(DocumentationTokens.JsonExporter, () => new JsonExporter());

  registry.registerSingleton(DocumentationTokens.ArchitectureSnapshotExporter, (provider) =>
    new ArchitectureSnapshotExporter(() =>
      provider.resolve(DocumentationTokens.ArchitectureValidator).validate(),
    ),
  );

  registry.registerSingleton(DocumentationTokens.DocumentationPlatform, (provider) =>
    new DocumentationPlatform(
      provider.resolve(DocumentationTokens.ArchitectureRegistry),
      provider.resolve(DocumentationTokens.DocumentationGenerator),
      provider.resolve(DocumentationTokens.ArchitectureValidator),
      provider.resolve(DocumentationTokens.MarkdownExporter),
      provider.resolve(DocumentationTokens.JsonExporter),
      provider.resolve(DocumentationTokens.ArchitectureSnapshotExporter),
    ),
  );
}
