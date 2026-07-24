import type { IMetricsCollector } from "@server/platform/observability/observability/contracts";
import {
  createMetricDescriptor,
  type MetricDescriptor,
  type MetricSource,
} from "@server/platform/observability/observability/models";
import { createMetricRecordedEvent } from "@server/platform/observability/observability/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { GatewayPlatform } from "@server/platform/gateway/gateway/gateway-platform";
import type { SDKPlatform } from "@server/platform/sdk/sdk/sdk-platform";
import type { ProviderRegistry } from "@server/platform/integration/integration";
import type { IHealthService, IDiagnosticsService } from "@server/platform/runtime/runtime/contracts";

/** Collects platform metrics metadata without BCM access. */
export class MetricsCollector implements IMetricsCollector {
  private readonly recorded: MetricDescriptor[] = [];

  constructor(
    private readonly healthService: IHealthService,
    private readonly diagnosticsService: IDiagnosticsService,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly gateway: GatewayPlatform,
    private readonly sdk: SDKPlatform,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  collect(): readonly MetricDescriptor[] {
    const bundle = this.documentation.generateDocumentation();
    const metrics: MetricDescriptor[] = [
      createMetricDescriptor({
        name: "platform.modules.count",
        source: "platform",
        value: bundle.summary.moduleCount,
      }),
      createMetricDescriptor({
        name: "platform.contracts.count",
        source: "platform",
        value: bundle.summary.contractCount,
      }),
      createMetricDescriptor({
        name: "provider.registry.count",
        source: "provider",
        value: this.providerRegistry.list().length,
      }),
      createMetricDescriptor({
        name: "runtime.health.integrated",
        source: "runtime",
        value: Number(Boolean(this.healthService)),
      }),
      createMetricDescriptor({
        name: "runtime.diagnostics.integrated",
        source: "runtime",
        value: Number(Boolean(this.diagnosticsService)),
      }),
      createMetricDescriptor({
        name: "gateway.versions.count",
        source: "gateway",
        value: this.gateway.supportedVersions().length,
      }),
      createMetricDescriptor({
        name: "sdk.platform.integrated",
        source: "sdk",
        value: Number(Boolean(this.sdk)),
      }),
      createMetricDescriptor({
        name: "testing.documented.modules",
        source: "testing",
        value: bundle.moduleCatalog.entries.filter((entry) => entry.registered).length,
      }),
      createMetricDescriptor({
        name: "governance.platform.integrated",
        source: "platform",
        value: Number(Boolean(this.governance)),
        labels: Object.freeze({ area: "governance" }),
      }),
    ];

    for (const metric of metrics) {
      this.record(metric);
    }

    return Object.freeze([...metrics]);
  }

  record(metric: MetricDescriptor): MetricDescriptor {
    this.recorded.push(Object.freeze({ ...metric }));
    createMetricRecordedEvent(metric);
    return metric;
  }

  query(source?: MetricSource): readonly MetricDescriptor[] {
    const filtered = source
      ? this.recorded.filter((metric) => metric.source === source)
      : this.recorded;
    return Object.freeze([...filtered]);
  }
}
