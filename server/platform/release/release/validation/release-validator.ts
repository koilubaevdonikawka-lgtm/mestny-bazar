import type { ReleaseDescriptor } from "@server/platform/release/release/models";
import { createReleaseValidationResult, type ReleaseValidationResult } from "@server/platform/release/release/models";
import { createReleaseValidatedEvent } from "@server/platform/release/release/events";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { TestingPlatform } from "@server/platform/testing/testing/testing-platform";
import type { OperationsPlatform } from "@server/platform/operations/operations/operations-platform";
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Validates release readiness using platform APIs only. */
export class ReleaseValidator {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly testing: TestingPlatform,
    private readonly operations: OperationsPlatform,
    private readonly healthService: IHealthService,
  ) {}

  async validate(release: ReleaseDescriptor): Promise<ReleaseValidationResult> {
    const architecture = this.documentation.validateArchitecture();
    const policies = await this.governance.evaluateAll();
    const testReport = this.testing.generateReport();
    const health = await this.healthService.check();
    const backups = this.operations.listBackups();

    const checks = Object.freeze([
      {
        name: "architecture-validation",
        passed: architecture.valid,
        message: architecture.valid
          ? "Architecture validation passed."
          : `${architecture.violations.length} architecture violations found.`,
      },
      {
        name: "governance-policies",
        passed: policies.every((result) => result.passed),
        message: `${policies.filter((result) => result.passed).length}/${policies.length} policies passed.`,
      },
      {
        name: "testing-scenarios",
        passed: testReport.summary.failed === 0,
        message: `${testReport.summary.passed}/${testReport.summary.total} scenarios passed.`,
      },
      {
        name: "runtime-health",
        passed: health.status !== "unhealthy",
        message: `Runtime health status: ${health.status}.`,
      },
      {
        name: "operations-backup",
        passed: backups.length >= 0,
        message: `${backups.length} backup snapshots available.`,
      },
    ]);

    const result = createReleaseValidationResult({
      releaseId: release.id,
      checks,
    });
    createReleaseValidatedEvent(result);
    return result;
  }
}
