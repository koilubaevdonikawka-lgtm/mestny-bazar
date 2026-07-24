import type { IBackupService } from "@server/platform/operations/operations/contracts";
import {
  createBackupDescriptor,
  type BackupDescriptor,
  type BackupSnapshotKind,
} from "@server/platform/operations/operations/models";
import { createBackupCompletedEvent } from "@server/platform/operations/operations/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { IConfigurationProvider, IHealthService, IDiagnosticsService } from "@server/platform/runtime/runtime/contracts";
import type { ProviderRegistry } from "@server/platform/integration/integration";

/** Creates platform snapshot backups from allowed platform APIs. */
export class BackupService implements IBackupService {
  private readonly backups = new Map<string, BackupDescriptor>();

  constructor(
    private readonly configuration: IConfigurationProvider,
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly healthService: IHealthService,
    private readonly diagnosticsService: IDiagnosticsService,
    private readonly providerRegistry: ProviderRegistry,
  ) {}

  async backup(): Promise<BackupDescriptor> {
    const kinds: BackupSnapshotKind[] = [
      "configuration",
      "documentation",
      "governance",
      "runtime",
      "provider-registry",
    ];

    const [health, diagnostics, governanceReport] = await Promise.all([
      this.healthService.check(),
      this.diagnosticsService.collect(),
      this.governance.generateReport(),
    ]);

    const descriptor = createBackupDescriptor({
      kinds,
      snapshots: Object.freeze({
        configuration: this.configuration.snapshot(),
        documentation: this.documentation.exportSnapshot(),
        governance: governanceReport,
        runtime: Object.freeze({ health, diagnostics }),
        "provider-registry": Object.freeze({
          providers: this.providerRegistry.list(),
        }),
      }),
    });

    this.backups.set(descriptor.id, descriptor);
    createBackupCompletedEvent(descriptor);
    return descriptor;
  }

  listBackups(): readonly BackupDescriptor[] {
    return Object.freeze([...this.backups.values()]);
  }

  getBackup(backupId: string): BackupDescriptor | undefined {
    return this.backups.get(backupId.trim());
  }
}
