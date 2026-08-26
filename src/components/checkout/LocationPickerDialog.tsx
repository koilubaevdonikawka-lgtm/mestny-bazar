import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TwoGisMapPicker } from "@/components/checkout/TwoGisMapPicker";
import type { PickedLocation } from "@/components/checkout/mapPickerTypes";
import { useTranslation } from "@/i18n/LanguageProvider";

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (location: PickedLocation) => void;
}

/**
 * Задача №153 — full interactive map alternative to the plain "Определить
 * моё местоположение" GPS button (Задача №151, still available as a
 * faster one-tap option): the customer taps/clicks their real point
 * instead of trusting device GPS accuracy alone or typing text.
 *
 * Задача №163 — architect's final call, informed by Задача №159's
 * measurements (2GIS loads noticeably slower than Yandex): only 2GIS is
 * offered here now, no provider choice. YandexMapPicker.tsx is deliberately
 * NOT deleted — it's just unused here, so re-enabling it later (or
 * reintroducing a choice) doesn't mean rebuilding it from scratch.
 */
export function LocationPickerDialog({ open, onOpenChange, onConfirm }: LocationPickerDialogProps) {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<PickedLocation | null>(null);

  useEffect(() => {
    if (open) setPicked(null);
  }, [open]);

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

        <TwoGisMapPicker onPick={setPicked} />

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
