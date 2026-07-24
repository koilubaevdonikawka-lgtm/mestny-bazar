import type { ILifecycleValidator } from "@server/platform/lifecycle/lifecycle/contracts";
import type { LifecycleComponent } from "@server/platform/lifecycle/lifecycle/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { OperationsPlatform } from "@server/platform/operations/operations/operations-platform";
import type { ObservabilityPlatform } from "@server/platform/observability/observability/observability-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IConfigurationProvider, IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Validates lifecycle prerequisites using platform metadata. */
export class LifecycleValidator implements ILifecycleValidator {
  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly healthService: IHealthService,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly operations: OperationsPlatform,
    private readonly observability: ObservabilityPlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  validateDependencies(component: LifecycleComponent): boolean {
    return component.dependencies.every((dependency) => dependency.trim().length > 0);
  }

  validateRequiredComponents(components: readonly LifecycleComponent[]): boolean {
    return components.length > 0;
  }

  validateConfiguration(): boolean {
    const snapshot = this.configuration.snapshot();
    return Boolean(snapshot.loadedAt);
  }

  validatePlatformReadiness(): boolean {
    const bundle = this.documentation.generateDocumentation();
    const providers = this.providerRegistry.list();
    void this.governance;
    void this.operations.listJobs();
    void this.observability.queryMetrics();
    return (
      bundle.summary.platformCount > 0 &&
      Boolean(this.healthService) &&
      providers.length >= 0
    );
  }
}
