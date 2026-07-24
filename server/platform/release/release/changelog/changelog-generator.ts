import type { IChangelogGenerator } from "@server/platform/release/release/contracts";
import { createChangelogEntry, type ChangelogEntry } from "@server/platform/release/release/models";
import type { DocumentationPlatform } from "@server/platform/documentation/documentation/documentation-platform";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { TestingPlatform } from "@server/platform/testing/testing/testing-platform";

/** Generates changelog entries from platform metadata sources. */
export class ChangelogGenerator implements IChangelogGenerator {
  constructor(
    private readonly documentation: DocumentationPlatform,
    private readonly governance: GovernancePlatform,
    private readonly testing: TestingPlatform,
  ) {}

  async generate(): Promise<readonly ChangelogEntry[]> {
    const snapshot = this.documentation.exportSnapshot();
    const governanceReport = await this.governance.generateReport();
    const testReport = this.testing.generateReport();

    const entries: ChangelogEntry[] = [
      createChangelogEntry({
        category: "architecture",
        summary: `Architecture snapshot ${snapshot.id} captured.`,
        details: `${snapshot.documentation.summary.moduleCount} modules, ${snapshot.documentation.summary.platformCount} platforms.`,
      }),
      createChangelogEntry({
        category: "documentation",
        summary: "Documentation snapshot included in release.",
        details: `Validation valid=${snapshot.validation.valid}, violations=${snapshot.validation.violations.length}.`,
      }),
      createChangelogEntry({
        category: "governance",
        summary: `Governance report: ${governanceReport.passed}/${governanceReport.totalPolicies} policies passed.`,
        details: `Evaluated at ${governanceReport.generatedAt}.`,
      }),
      createChangelogEntry({
        category: "testing",
        summary: `Testing report: ${testReport.summary.passed}/${testReport.summary.total} scenarios passed.`,
        details: `Generated at ${testReport.generatedAt}.`,
      }),
    ];

    if (!snapshot.validation.valid) {
      entries.push(
        createChangelogEntry({
          category: "architecture",
          summary: "Architecture validation reported violations.",
          details: snapshot.validation.violations.map((v) => v.message).join("; "),
        }),
      );
    }

    return Object.freeze(entries);
  }
}
