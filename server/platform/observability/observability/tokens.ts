/** DI tokens for the observability platform. */
export const ObservabilityTokens = {
  ObservabilityPlatform: Symbol.for("observability.platform"),
  ObservabilityManager: Symbol.for("observability.manager"),
  TelemetryRegistry: Symbol.for("observability.telemetryRegistry"),
  MetricsCollector: Symbol.for("observability.metricsCollector"),
  TracingEngine: Symbol.for("observability.tracingEngine"),
  LoggingRegistry: Symbol.for("observability.loggingRegistry"),
  CorrelationManager: Symbol.for("observability.correlationManager"),
  SamplingPolicyEngine: Symbol.for("observability.samplingPolicyEngine"),
} as const;

export type ObservabilityToken = (typeof ObservabilityTokens)[keyof typeof ObservabilityTokens];
