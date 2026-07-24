import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import {
  AssertionLibrary,
  FixtureFactory,
  ReportGenerator,
  ScenarioRunner,
  TestingPlatform,
  TestingTokens,
  createDefaultScenarios,
} from "@server/platform/testing/testing";

/** Registers testing platform services and default scenarios. */
export function registerTestingPlatform(registry: ServiceRegistry): void {
  registry.registerSingleton(TestingTokens.AssertionLibrary, () => new AssertionLibrary());
  registry.registerSingleton(TestingTokens.FixtureFactory, () => new FixtureFactory());
  registry.registerSingleton(TestingTokens.ReportGenerator, () => new ReportGenerator());

  registry.registerSingleton(TestingTokens.ScenarioRunner, () => {
    const runner = new ScenarioRunner();
    for (const scenario of createDefaultScenarios()) {
      runner.register(scenario);
    }
    return runner;
  });

  registry.registerSingleton(TestingTokens.TestingPlatform, (provider) =>
    new TestingPlatform(
      provider,
      provider.resolve(TestingTokens.ScenarioRunner),
      provider.resolve(TestingTokens.FixtureFactory),
      provider.resolve(TestingTokens.AssertionLibrary),
      provider.resolve(TestingTokens.ReportGenerator),
    ),
  );
}
