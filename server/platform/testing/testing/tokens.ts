/** DI tokens for the testing platform. */
export const TestingTokens = {
  TestingPlatform: Symbol.for("testing.platform"),
  ScenarioRunner: Symbol.for("testing.scenarioRunner"),
  FixtureFactory: Symbol.for("testing.fixtureFactory"),
  AssertionLibrary: Symbol.for("testing.assertionLibrary"),
  ReportGenerator: Symbol.for("testing.reportGenerator"),
} as const;

export type TestingToken = (typeof TestingTokens)[keyof typeof TestingTokens];
