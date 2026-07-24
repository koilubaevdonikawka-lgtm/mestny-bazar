import type { ICleanupService } from "@server/platform/operations/operations/contracts";
import { createMaintenanceResult, type MaintenanceResult } from "@server/platform/operations/operations/models";
import { createMaintenanceCompletedEvent } from "@server/platform/operations/operations/events";
import type { IDiagnosticsService } from "@server/platform/runtime/runtime/contracts";
import type { TestingPlatform } from "@server/platform/testing/testing/testing-platform";

interface CleanupArtifactStore {
  temporaryFiles: string[];
  expiredTokens: string[];
  expiredSessions: string[];
  staleCaches: string[];
  obsoleteDiagnostics: string[];
  testArtifacts: string[];
}

/** Cleans operational artifacts using platform metadata only. */
export class CleanupService implements ICleanupService {
  private readonly store: CleanupArtifactStore = {
    temporaryFiles: [],
    expiredTokens: [],
    expiredSessions: [],
    staleCaches: [],
    obsoleteDiagnostics: [],
    testArtifacts: [],
  };

  constructor(
    private readonly diagnosticsService: IDiagnosticsService,
    private readonly testingPlatform: TestingPlatform,
  ) {}

  seedArtifacts(artifacts: Partial<CleanupArtifactStore>): void {
    if (artifacts.temporaryFiles) {
      this.store.temporaryFiles.push(...artifacts.temporaryFiles);
    }
    if (artifacts.expiredTokens) {
      this.store.expiredTokens.push(...artifacts.expiredTokens);
    }
    if (artifacts.expiredSessions) {
      this.store.expiredSessions.push(...artifacts.expiredSessions);
    }
    if (artifacts.staleCaches) {
      this.store.staleCaches.push(...artifacts.staleCaches);
    }
    if (artifacts.obsoleteDiagnostics) {
      this.store.obsoleteDiagnostics.push(...artifacts.obsoleteDiagnostics);
    }
    if (artifacts.testArtifacts) {
      this.store.testArtifacts.push(...artifacts.testArtifacts);
    }
  }

  async cleanup(): Promise<MaintenanceResult> {
    const startedAt = new Date().toISOString();

    await this.diagnosticsService.collect();
    this.testingPlatform.generateReport();

    const categories = [
      { category: "temporary-files", removed: this.store.temporaryFiles.length },
      { category: "expired-tokens", removed: this.store.expiredTokens.length },
      { category: "expired-sessions", removed: this.store.expiredSessions.length },
      { category: "stale-caches", removed: this.store.staleCaches.length },
      { category: "obsolete-diagnostics", removed: this.store.obsoleteDiagnostics.length },
      { category: "test-artifacts", removed: this.store.testArtifacts.length },
    ];

    this.store.temporaryFiles = [];
    this.store.expiredTokens = [];
    this.store.expiredSessions = [];
    this.store.staleCaches = [];
    this.store.obsoleteDiagnostics = [];
    this.store.testArtifacts = [];

    const totalRemoved = categories.reduce((sum, entry) => sum + entry.removed, 0);
    const result = createMaintenanceResult({
      operation: "cleanup",
      status: "completed",
      startedAt,
      summary: `Removed ${totalRemoved} operational artifacts across ${categories.length} categories.`,
      details: Object.freeze({ categories }),
    });

    createMaintenanceCompletedEvent(result);
    return result;
  }
}
