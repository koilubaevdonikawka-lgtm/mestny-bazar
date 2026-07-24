export interface GeoCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface GeocodeRequest {
  readonly address: string;
}

export interface GeocodeResult {
  readonly coordinates: GeoCoordinates;
  readonly formattedAddress: string;
}

export interface ReverseGeocodeRequest {
  readonly coordinates: GeoCoordinates;
}

/** Platform map provider contract. */
export interface IMapProvider {
  geocode(request: GeocodeRequest): Promise<GeocodeResult>;
  reverseGeocode(request: ReverseGeocodeRequest): Promise<GeocodeResult>;
}
