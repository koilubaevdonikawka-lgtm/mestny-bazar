import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { YandexMapPicker } from "@/components/checkout/YandexMapPicker";
import { TwoGisMapPicker } from "@/components/checkout/TwoGisMapPicker";
import type { PickedLocation } from "@/components/checkout/mapPickerTypes";
import { MAP_PROVIDER_STORAGE_KEY, type MapProvider } from "@/lib/mapDefaults";
import { useTranslation } from "@/i18n/LanguageProvider";

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (location: PickedLocation) => void;
}

function readStoredProvider(): MapProvider {
  if (typeof window === "undefined") return "yandex";
  return window.localStorage.getItem(MAP_PROVIDER_STORAGE_KEY) === "2gis" ? "2gis" : "yandex";
}

/**
 * Задача №153 — replaces/supplements the plain "Определить моё
 * местоположение" GPS button (Задача №151, still available as a faster
 * one-tap option) with a full interactive map: the customer taps/clicks
 * their real point instead of trusting device GPS accuracy or typing text.
 * Either map provider can be switched to the other independently — both are
 * equally easy to disable (each is its own component, gated purely on its
 * own env var) since the architect flagged the 2GIS demo key as expiring
 * ~25.09.2026.
 */
export function LocationPickerDialog({ open, onOpenChange, onConfirm }: LocationPickerDialogProps) {
  const { t } = useTranslation();
  const [provider, setProvider] = useState<MapProvider>("yandex");
  const [picked, setPicked] = useState<PickedLocation | null>(null);

  useEffect(() => {
    if (open) {
      setProvider(readStoredProvider());
      setPicked(null);
    }
  }, [open]);

  const handleProviderChange = (value: string) => {
    const next: MapProvider = value === "2gis" ? "2gis" : "yandex";
    setProvider(next);
    window.localStorage.setItem(MAP_PROVIDER_STORAGE_KEY, next);
    setPicked(null);
  };

  const handleConfirm = () => {
    if (!picked) return;
    onConfirm(picked);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("cart.mapDialogTitle")}</DialogTitle>
          <DialogDescription>{t("cart.mapDialogDescription")}</DialogDescription>
        </DialogHeader>

        <Tabs value={provider} onValueChange={handleProviderChange}>
          <TabsList>
            <TabsTrigger value="yandex">Яндекс.Карты</TabsTrigger>
            <TabsTrigger value="2gis">2GIS</TabsTrigger>
          </TabsList>
          {/* Radix TabsContent unmounts the inactive tab by default — each
              map SDK script only ever loads once its own tab is actually
              shown, and switching tabs releases the previous map instance
              (each picker's effect cleanup calls map.destroy()). */}
          <TabsContent value="yandex">
            <YandexMapPicker onPick={setPicked} />
          </TabsContent>
          <TabsContent value="2gis">
            <TwoGisMapPicker onPick={setPicked} />
          </TabsContent>
        </Tabs>

        <p className="min-h-5 text-sm text-muted-foreground">
          {picked && (picked.address ?? t("cart.mapPointSelectedNoAddress"))}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!picked}>
            {t("cart.mapConfirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
