import type {
  GeocodeRequest,
  GeocodeResult,
  IMapProvider,
  ReverseGeocodeRequest,
} from "@server/platform/integration/integration/contracts";

/** Placeholder map provider until an external maps service is configured. */
export class NoopMapProvider implements IMapProvider {
  geocode(_request: GeocodeRequest): Promise<GeocodeResult> {
    return Promise.reject(new Error("Map provider is not configured."));
  }

  reverseGeocode(_request: ReverseGeocodeRequest): Promise<GeocodeResult> {
    return Promise.reject(new Error("Map provider is not configured."));
  }
}
