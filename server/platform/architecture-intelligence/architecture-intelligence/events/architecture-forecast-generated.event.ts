import type { ArchitectureForecast } from "@server/platform/architecture-intelligence/architecture-intelligence/models";

export interface ArchitectureForecastGeneratedEvent {
  readonly type: "architecture-intelligence.forecast.generated";
  readonly forecast: ArchitectureForecast;
}

export function createArchitectureForecastGeneratedEvent(
  forecast: ArchitectureForecast,
): ArchitectureForecastGeneratedEvent {
  return Object.freeze({ type: "architecture-intelligence.forecast.generated", forecast });
}
