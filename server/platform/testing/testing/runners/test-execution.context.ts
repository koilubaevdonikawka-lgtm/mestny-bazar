import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import type { TestFixtureBundle } from "@server/platform/testing/testing/models";
import type { AssertionLibrary } from "@server/platform/testing/testing/assertions";
import type { FixtureFactory } from "@server/platform/testing/testing/fixtures";

/** Execution context exposing only Module API resolution for scenarios. */
export interface TestExecutionContext {
  readonly provider: ServiceProvider;
  readonly fixtures: TestFixtureBundle;
  readonly assertions: AssertionLibrary;
  resolveModule<T>(token: symbol): T;
}

export function createTestExecutionContext(input: {
  provider: ServiceProvider;
  fixtures: TestFixtureBundle;
  assertions: AssertionLibrary;
}): TestExecutionContext {
  return Object.freeze({
    provider: input.provider,
    fixtures: input.fixtures,
    assertions: input.assertions,
    resolveModule: <T>(token: symbol) => input.provider.resolve<T>(token),
  });
}

export function createEmptyFixtureBundle(factory: FixtureFactory): TestFixtureBundle {
  return factory.createBundle();
}
