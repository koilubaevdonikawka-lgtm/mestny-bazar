import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import type { ScenarioReport, TestFixtureBundle, TestReport } from "@server/platform/testing/testing/models";
import type { AssertionLibrary } from "@server/platform/testing/testing/assertions";
import type { FixtureFactory } from "@server/platform/testing/testing/fixtures";
import type { ScenarioRunner } from "@server/platform/testing/testing/runners";
import { createTestExecutionContext } from "@server/platform/testing/testing/runners";
import type { ReportGenerator } from "@server/platform/testing/testing/reports";

/** Public testing platform facade for end-to-end scenario execution. */
export class TestingPlatform {
  private fixtures: TestFixtureBundle;
  private lastReports: ScenarioReport[] = [];

  constructor(
    private readonly provider: ServiceProvider,
    private readonly scenarioRunner: ScenarioRunner,
    private readonly fixtureFactory: FixtureFactory,
    private readonly assertionLibrary: AssertionLibrary,
    private readonly reportGenerator: ReportGenerator,
    initialFixtures?: TestFixtureBundle,
  ) {
    this.fixtures = initialFixtures ?? fixtureFactory.createBundle();
  }

  async runScenario(scenarioId: string): Promise<ScenarioReport> {
    const context = this.createContext();
    const report = await this.scenarioRunner.run(scenarioId, context);
    this.lastReports = [report];
    return report;
  }

  async runAll(): Promise<TestReport> {
    const context = this.createContext();
    this.lastReports = [...(await this.scenarioRunner.runAll(context))];
    return this.generateReport();
  }

  async loadFixtures(bundle?: TestFixtureBundle): Promise<TestFixtureBundle> {
    const seedBundle = bundle ?? this.fixtureFactory.createBundle();
    const context = createTestExecutionContext({
      provider: this.provider,
      fixtures: seedBundle,
      assertions: this.assertionLibrary,
    });
    this.fixtures = await this.fixtureFactory.seed(context, seedBundle);
    return this.fixtures;
  }

  generateReport(): TestReport {
    return this.reportGenerator.generate(this.lastReports);
  }

  getFixtures(): TestFixtureBundle {
    return this.fixtures;
  }

  private createContext() {
    return createTestExecutionContext({
      provider: this.provider,
      fixtures: this.fixtures,
      assertions: this.assertionLibrary,
    });
  }
}
