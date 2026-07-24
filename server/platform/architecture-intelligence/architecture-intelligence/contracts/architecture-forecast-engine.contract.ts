import type {
  ArchitectureForecast,
  ForecastKind,
} from "@server/platform/architecture-intelligence/architecture-intelligence/models";

/** Contract for architecture change forecasting (metadata only). */
export interface IArchitectureForecastEngine {
  forecast(kind?: ForecastKind): ArchitectureForecast;
}
