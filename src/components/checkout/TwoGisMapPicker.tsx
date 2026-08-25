import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadExternalScript } from "@/lib/loadExternalScript";
import { reverseGeocode } from "@/lib/reverseGeocode";
import { DEFAULT_MAP_CENTER } from "@/lib/mapDefaults";
import { MapUnavailableNotice } from "@/components/checkout/MapUnavailableNotice";
import type { MapPickerProps } from "@/components/checkout/mapPickerTypes";

/**
 * Задача №153 — minimal surface of the 2GIS MapGL JS API this component
 * actually uses; no official TS types are installed (script-tag SDK, not an
 * npm package). MapGL uses [longitude, latitude] coordinate order
 * throughout — the opposite of Yandex's [latitude, longitude] — every
 * conversion below is explicit about which order it's holding.
 */
interface MapGLMarker {
  on(event: "dragend", handler: () => void): void;
  getCoordinates(): [number, number];
  setCoordinates(coordinates: [number, number]): void;
}

interface MapGLMap {
  on(event: "click", handler: (e: { lngLat: [number, number] }) => void): void;
  destroy?: () => void;
}

interface MapGLNamespace {
  Map: new (
    container: HTMLElement,
    options: { center: [number, number]; zoom: number; key: string },
  ) => MapGLMap;
  Marker: new (
    map: MapGLMap,
    options: { coordinates: [number, number]; draggable?: boolean },
  ) => MapGLMarker;
}

declare global {
  interface Window {
    mapgl?: MapGLNamespace;
  }
}

type LoadStatus = "loading" | "ready" | "error";

/**
 * Задача №153 — same interaction as YandexMapPicker (click or drag to pick a
 * point), reverse-geocoded via the same Nominatim helper for consistency —
 * 2GIS's own geocoding is a separate product/API key from MapGL, so reusing
 * Nominatim avoids needing a third credential and a second response shape.
 */
export function TwoGisMapPicker({ onPick }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapGLMap | null>(null);
  const markerRef = useRef<MapGLMarker | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  const apiKey = import.meta.env.VITE_TWOGIS_API_KEY as string | undefined;

  useEffect(() => {
    if (!apiKey) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const resolvePoint = (lon: number, lat: number) => {
      onPick({ latitude: lat, longitude: lon, address: null });
      void reverseGeocode(lat, lon).then((address) => {
        if (!cancelled && address) onPick({ latitude: lat, longitude: lon, address });
      });
    };

    loadExternalScript("https://mapgl.2gis.com/api/js/v1")
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const mapgl = window.mapgl!;
        const map = new mapgl.Map(containerRef.current, {
          center: [DEFAULT_MAP_CENTER.longitude, DEFAULT_MAP_CENTER.latitude],
          zoom: 12,
          key: apiKey,
        });
        mapRef.current = map;

        map.on("click", (e) => {
          const [lon, lat] = e.lngLat;
          if (markerRef.current) {
            markerRef.current.setCoordinates([lon, lat]);
          } else {
            const marker = new mapgl.Marker(map, { coordinates: [lon, lat], draggable: true });
            marker.on("dragend", () => {
              const [dragLon, dragLat] = marker.getCoordinates();
              resolvePoint(dragLon, dragLat);
            });
            markerRef.current = marker;
          }
          resolvePoint(lon, lat);
        });

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      mapRef.current?.destroy?.();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see YandexMapPicker's identical note.
  }, [apiKey]);

  if (status === "error") {
    return <MapUnavailableNotice />;
  }

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl border">
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary/40">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
