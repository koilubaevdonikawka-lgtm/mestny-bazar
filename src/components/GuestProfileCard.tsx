import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listDeliveryZones } from "@/api/delivery-zone";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useTranslation } from "@/i18n/LanguageProvider";

const MIN_ADDRESS_LENGTH = 5;
const MIN_PHONE_DIGITS = 9;

/**
 * The signed-out counterpart of /profile's ProfileAndDefaultAddressCard:
 * same Изменить/Сохранить toggle, but backed by useCheckoutStore's
 * localStorage-persisted guest fields instead of the server Profile/Address
 * — the exact fields GuestCheckoutFields reads, so whatever is saved here is
 * what the cart prefills. Nothing here ever reaches the server until an
 * order is placed with it.
 *
 * Kept deliberately to what guest checkout actually sends (name, phone,
 * address text, zone) — no city/map point, which the guest order payload
 * has no slot for.
 */
export function GuestProfileCard() {
  const { t } = useTranslation();
  const { guestName, guestPhone, guestAddress, guestZoneId, setGuestContact } = useCheckoutStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState("");

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing) {
      setName(guestName);
      setPhone(guestPhone);
      setAddress(guestAddress);
      setZoneId(guestZoneId ?? "");
      setIsEditing(true);
      return;
    }
    if (phone.replace(/\D/g, "").length < MIN_PHONE_DIGITS) {
      toast.error(t("profile.phoneTooShortError"));
      return;
    }
    if (address.trim().length < MIN_ADDRESS_LENGTH) {
      toast.error(t("addresses.tooShortError"));
      return;
    }
    setGuestContact({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      zoneId: zoneId || null,
    });
    toast.success(t("profile.guestSavedToast"));
    setIsEditing(false);
  };

  const zoneName = deliveryZones?.find((z) => z.id === guestZoneId)?.name;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-6 space-y-4"
      data-testid="guest-profile-card"
    >
      <h2 className="font-serif text-2xl">{t("profile.personalDataAndAddressTitle")}</h2>
      <p className="text-sm text-muted-foreground">{t("profile.guestLocalNotice")}</p>
      {isEditing ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guestProfileName">{t("profile.optionalNameField")}</Label>
              <Input
                id="guestProfileName"
                autoComplete="name"
                placeholder={t("profile.fullNamePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guestProfilePhone">{t("profile.phoneField")} *</Label>
              <Input
                id="guestProfilePhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t("profile.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestProfileAddress">{t("addresses.fullAddressField")} *</Label>
            <Input
              id="guestProfileAddress"
              autoComplete="street-address"
              placeholder={t("home.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestProfileZone">{t("home.deliveryZoneLabel")}</Label>
            <select
              id="guestProfileZone"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t("home.zoneNotSelected")}</option>
              {(deliveryZones ?? []).map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("profile.fullNameField")}</p>
            <p className="font-medium">{guestName || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("profile.phoneField")}</p>
            <p className="font-medium">{guestPhone || "—"}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("addresses.fullAddressField")}</p>
            <p className="font-medium">{guestAddress || "—"}</p>
            {zoneName && (
              <p className="text-sm text-muted-foreground">
                {t("addresses.zoneDisplay", { zoneName })}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{isEditing ? t("profile.saveButton") : t("common.edit")}</Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
