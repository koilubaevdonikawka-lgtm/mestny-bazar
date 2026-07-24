import type { TestFixtureBundle } from "@server/platform/testing/testing/models";

/** Contract for test fixture generation and loading. */
export interface ITestFixture {
  createBundle(): TestFixtureBundle;
}
