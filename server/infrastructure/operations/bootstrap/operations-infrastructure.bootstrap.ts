import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createMaintenanceJob,
  OperationsTokens,
  type MaintenanceScheduler,
} from "@server/platform/operations/operations";

const DEFAULT_MAINTENANCE_JOBS = Object.freeze([
  createMaintenanceJob({
    id: "ops-daily-cleanup",
    name: "Daily Cleanup",
    operation: "cleanup",
    schedule: "0 2 * * *",
  }),
  createMaintenanceJob({
    id: "ops-weekly-backup",
    name: "Weekly Backup",
    operation: "backup",
    schedule: "0 3 * * 0",
  }),
  createMaintenanceJob({
    id: "ops-monthly-retention",
    name: "Monthly Retention",
    operation: "retention",
    schedule: "0 4 1 * *",
  }),
]);

/** Activates operations platform metadata and default maintenance job schedules. */
export function activateOperationsPlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-operations",
      name: "Operations Platform",
      path: "server/platform/operations",
      components: [
        "OperationsPlatform",
        "MaintenanceEngine",
        "CleanupService",
        "BackupService",
        "RestoreService",
        "RetentionService",
        "MaintenanceScheduler",
      ],
      dependencies: [
        "platform-runtime",
        "platform-documentation",
        "platform-governance",
        "platform-testing",
        "platform-integration",
      ],
    }),
  });

  const scheduler = provider.resolve<MaintenanceScheduler>(
    OperationsTokens.MaintenanceScheduler,
  );

  for (const job of DEFAULT_MAINTENANCE_JOBS) {
    try {
      scheduler.registerJob(job);
    } catch {
      // Job may already be registered during repeated bootstrap.
    }
  }
}
