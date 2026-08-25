import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadExternalScript } from "@/lib/loadExternalScript";
import { reverseGeocode } from "@/lib/reverseGeocode";
import { DEFAULT_MAP_CENTER } from "@/lib/mapDefaults";
import { MapUnavailableNotice } from "@/components/checkout/MapUnavailableNotice";
import type { MapPickerProps } from "@/components/checkout/mapPickerTypes";

/** Задача №153 — minimal surface of the Yandex Maps JS API 2.1 this component actually uses; no official TS types are installed (script-tag SDK, not an npm package). */
interface YMapsPlacemark {
  geometry: {
    getCoordinates(): [number, number];
    setCoordinates(coords: [number, number]): void;
  };
  events: { add(event: string, handler: () => void): void };
}

interface YMapsMap {
  events: {
    add(event: string, handler: (e: { get(key: "coords"): [number, number] }) => void): void;
  };
  geoObjects: { add(object: YMapsPlacemark): void };
  destroy?: () => void;
}

interface YMapsNamespace {
  ready(callback: () => void): void;
  Map: new (
    element: HTMLElement,
    options: { center: [number, number]; zoom: number; controls?: string[] },
  ) => YMapsMap;
  Placemark: new (
    coordinates: [number, number],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => YMapsPlacemark;
}

declare global {
  interface Window {
    ymaps?: YMapsNamespace;
  }
}

type LoadStatus = "loading" | "ready" | "error";

/**
 * Задача №153 — click or drag a placemark to pick a point; reverse-geocoded
 * via Nominatim (not ymaps.geocode()) for consistency with TwoGisMapPicker —
 * one geocoding code path instead of two differently-shaped provider
 * responses, and it sidesteps any uncertainty about whether basic geocode()
 * calls stay free indefinitely under just the Maps JS API key.
 */
export function YandexMapPicker({ onPick }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<YMapsMap | null>(null);
  const placemarkRef = useRef<YMapsPlacemark | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY as string | undefined;

  useEffect(() => {
    if (!apiKey) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const resolvePoint = (placemark: YMapsPlacemark, lat: number, lon: number) => {
      placemark.geometry.setCoordinates([lat, lon]);
      onPick({ latitude: lat, longitude: lon, address: null });
      void reverseGeocode(lat, lon).then((address) => {
        if (!cancelled && address) onPick({ latitude: lat, longitude: lon, address });
      });
    };

    // Задача №158 — csp=true is required by Yandex's own docs
    // (yandex.com/dev/jsapi-v2-1/doc/en/v2-1/dg/concepts/load) for the API to
    // behave under a restrictive CSP at all; without it, the API silently
    // relies on patterns this project's CSP does not allow.
    loadExternalScript(
      `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU&csp=true`,
    )
      .then(
        () =>
          new Promise<void>((resolve) => {
            window.ymaps!.ready(resolve);
          }),
      )
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const ymaps = window.ymaps!;
        const map = new ymaps.Map(containerRef.current, {
          center: [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude],
          zoom: 12,
          controls: ["zoomControl"],
        });
        mapRef.current = map;

        map.events.add("click", (e) => {
          const [lat, lon] = e.get("coords");
          if (!placemarkRef.current) {
            const placemark = new ymaps.Placemark([lat, lon], {}, { draggable: true });
            placemark.events.add("dragend", () => {
              const [dragLat, dragLon] = placemark.geometry.getCoordinates();
              resolvePoint(placemark, dragLat, dragLon);
            });
            map.geoObjects.add(placemark);
            placemarkRef.current = placemark;
          }
          resolvePoint(placemarkRef.current, lat, lon);
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
      placemarkRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onPick is a stable callback identity concern for the caller, not this effect's own re-init condition; re-running on every render would re-create the map.
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
