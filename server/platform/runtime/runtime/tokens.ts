/** DI tokens for runtime platform services. */
export const RuntimeTokens = {
  HealthService: Symbol.for("runtime.healthService"),
  ReadinessService: Symbol.for("runtime.readinessService"),
  LivenessService: Symbol.for("runtime.livenessService"),
  DiagnosticsService: Symbol.for("runtime.diagnosticsService"),
  ConfigurationService: Symbol.for("runtime.configurationService"),
  SecretProvider: Symbol.for("runtime.secretProvider"),
  ApplicationLifecycle: Symbol.for("runtime.applicationLifecycle"),
  StartupValidator: Symbol.for("runtime.startupValidator"),
} as const;

export type RuntimeToken = (typeof RuntimeTokens)[keyof typeof RuntimeTokens];
