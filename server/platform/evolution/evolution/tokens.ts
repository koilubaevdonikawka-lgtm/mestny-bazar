/** DI tokens for the evolution platform. */
export const EvolutionTokens = {
  EvolutionPlatform: Symbol.for("evolution.platform"),
  EvolutionManager: Symbol.for("evolution.manager"),
  MigrationRegistry: Symbol.for("evolution.migrationRegistry"),
  MigrationPlanner: Symbol.for("evolution.migrationPlanner"),
  CompatibilityEngine: Symbol.for("evolution.compatibilityEngine"),
  ForwardCompatibilityStrategy: Symbol.for("evolution.forwardCompatibilityStrategy"),
  BackwardCompatibilityStrategy: Symbol.for("evolution.backwardCompatibilityStrategy"),
  RollingMigrationStrategy: Symbol.for("evolution.rollingMigrationStrategy"),
  BlueGreenPreparationStrategy: Symbol.for("evolution.blueGreenPreparationStrategy"),
  CanaryPreparationStrategy: Symbol.for("evolution.canaryPreparationStrategy"),
} as const;

export type EvolutionToken = (typeof EvolutionTokens)[keyof typeof EvolutionTokens];
