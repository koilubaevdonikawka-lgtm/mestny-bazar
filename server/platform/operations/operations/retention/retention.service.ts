import type { IRetentionService } from "@server/platform/operations/operations/contracts";
import {
  createMaintenanceResult,
  createRetentionPolicy,
  type MaintenanceResult,
  type RetentionPolicy,
  type RetentionTarget,
} from "@server/platform/operations/operations/models";
import { createRetentionCompletedEvent } from "@server/platform/operations/operations/events";
import type { IBackupService } from "@server/platform/operations/operations/contracts";

interface RetentionArtifact {
  readonly id: string;
  readonly target: RetentionTarget;
  readonly createdAt: string;
}

const DEFAULT_POLICIES: readonly RetentionPolicy[] = Object.freeze([
  createRetentionPolicy({ id: "retention-logs", target: "logs", maxAgeDays: 30, maxItems: 1000 }),
  createRetentionPolicy({ id: "retention-reports", target: "reports", maxAgeDays: 90, maxItems: 500 }),
  createRetentionPolicy({ id: "retention-diagnostics", target: "diagnostics", maxAgeDays: 14, maxItems: 200 }),
  createRetentionPolicy({ id: "retention-snapshots", target: "snapshots", maxAgeDays: 180, maxItems: 50 }),
  createRetentionPolicy({ id: "retention-test-results", target: "test-results", maxAgeDays: 7, maxItems: 100 }),
]);

/** Applies retention policies to operational artifacts. */
export class RetentionService implements IRetentionService {
  private readonly policies = new Map<string, RetentionPolicy>();
  private readonly artifacts: RetentionArtifact[] = [];

  constructor(private readonly backupService: IBackupService) {
    for (const policy of DEFAULT_POLICIES) {
      this.policies.set(policy.id, policy);
    }
  }

  registerPolicy(policy: RetentionPolicy): void {
    this.policies.set(policy.id, policy);
  }

  listPolicies(): readonly RetentionPolicy[] {
    return Object.freeze([...this.policies.values()]);
  }

  trackArtifact(artifact: RetentionArtifact): void {
    this.artifacts.push(Object.freeze({ ...artifact }));
  }

  applyRetention(): MaintenanceResult {
    const startedAt = new Date().toISOString();
    const now = Date.now();
    const enabledPolicies = [...this.policies.values()].filter((policy) => policy.enabled);

    let removed = 0;
    const remaining: RetentionArtifact[] = [];

    for (const artifact of this.artifacts) {
      const policy = enabledPolicies.find((entry) => entry.target === artifact.target);
      if (!policy) {
        remaining.push(artifact);
        continue;
      }

      const ageDays = (now - Date.parse(artifact.createdAt)) / (1000 * 60 * 60 * 24);
      if (ageDays > policy.maxAgeDays) {
        removed += 1;
        continue;
      }
      remaining.push(artifact);
    }

    this.artifacts.length = 0;
    this.artifacts.push(...remaining);

    const snapshotPolicy = enabledPolicies.find((policy) => policy.target === "snapshots");
    let snapshotsRemoved = 0;
    if (snapshotPolicy) {
      const backups = this.backupService.listBackups();
      const maxItems = snapshotPolicy.maxItems;
      if (backups.length > maxItems) {
        snapshotsRemoved = backups.length - maxItems;
      }
    }

    const result = createMaintenanceResult({
      operation: "retention",
      status: "completed",
      startedAt,
      summary: `Retention applied: ${removed} artifacts removed, ${snapshotsRemoved} snapshots trimmed.`,
      details: Object.freeze({
        policiesApplied: enabledPolicies.length,
        artifactsRemoved: removed,
        snapshotsTrimmed: snapshotsRemoved,
        artifactsRemaining: this.artifacts.length,
      }),
    });

    createRetentionCompletedEvent(result);
    return result;
  }
}
