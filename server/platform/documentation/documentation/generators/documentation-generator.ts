import type { IDocumentationGenerator } from "@server/platform/documentation/documentation/contracts";
import type { IArchitectureRegistry } from "@server/platform/documentation/documentation/contracts";
import type { DocumentationBundle } from "@server/platform/documentation/documentation/models";
import { createDocumentationGeneratedEvent } from "@server/platform/documentation/documentation/events";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { BootstrapTokens } from "@server/bootstrap/tokens";

/** Generates architecture documentation from the registry. */
export class DocumentationGenerator implements IDocumentationGenerator {
  constructor(
    private readonly registry: IArchitectureRegistry,
    private readonly serviceRegistry: ServiceRegistry,
  ) {}

  generate(): DocumentationBundle {
    const modules = this.registry.listModules();
    const platforms = this.registry.listPlatforms();
    const providers = this.registry.listProviders();
    const dependencies = this.registry.listDependencies();
    const contracts = this.registry.listContracts();
    const domainEvents = this.registry.listDomainEvents();
    const moduleApis = this.registry.listModuleApis();

    const moduleCatalog = Object.freeze({
      entries: Object.freeze(
        modules.map((module) =>
          Object.freeze({
            module,
            registered: this.isModuleRegistered(module.moduleApiToken),
          }),
        ),
      ),
    });

    const documentation: DocumentationBundle = Object.freeze({
      summary: Object.freeze({
        generatedAt: new Date().toISOString(),
        moduleCount: modules.length,
        platformCount: platforms.length,
        providerCount: providers.length,
        dependencyCount: dependencies.length,
        contractCount: contracts.length,
        domainEventCount: domainEvents.length,
      }),
      moduleCatalog,
      dependencyGraph: Object.freeze({
        nodes: this.registry.listNodes(),
        edges: dependencies,
      }),
      publicApiCatalog: Object.freeze({
        entries: Object.freeze(
          modules.map((module) =>
            Object.freeze({
              moduleId: module.id,
              moduleName: module.name,
              methods:
                moduleApis.find((entry) => entry.moduleId === module.id)?.methods ??
                module.publicMethods,
            }),
          ),
        ),
      }),
      providerCatalog: Object.freeze({ providers }),
      platformCatalog: Object.freeze({ platforms }),
      contracts,
      domainEvents,
    });

    createDocumentationGeneratedEvent({
      moduleCount: modules.length,
      platformCount: platforms.length,
    });

    return documentation;
  }

  private isModuleRegistered(moduleApiToken: string): boolean {
    for (const token of Object.values(BootstrapTokens)) {
      if (String(token) === moduleApiToken) {
        return this.serviceRegistry.has(token);
      }
    }
    return false;
  }
}
