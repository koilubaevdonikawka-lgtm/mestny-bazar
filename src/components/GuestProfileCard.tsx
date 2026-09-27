import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listDeliveryZones } from "@/api/delivery-zone";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useTranslation } from "@/i18n/LanguageProvider";

/**
 * The signed-out counterpart of /profile's ProfileAndDefaultAddressCard,
 * backed by useCheckoutStore's localStorage-persisted guest fields instead
 * of the server Profile/Address — the exact fields GuestCheckoutFields
 * reads, so whatever is typed here is what the cart prefills.
 *
 * Plain always-editable inputs, saved on every change (same as the cart's
 * guest form): no view/edit toggle and no Save button. Writing on change
 * rather than on blur because closing/backgrounding the app on a phone
 * doesn't reliably fire blur, and a local store write is free. Validation
 * stays where it already is — at order submission (useCreateOrder).
 */
export function GuestProfileCard() {
  const { t } = useTranslation();
  const { guestName, guestPhone, guestAddress, guestZoneId, setGuestContact } = useCheckoutStore();

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div
      className="rounded-2xl border border-border/60 bg-card p-6 space-y-4"
      data-testid="guest-profile-card"
    >
      <div className="space-y-2">
        <Label htmlFor="guestProfileName">{t("profile.fullNameField")}</Label>
        <Input
          id="guestProfileName"
          autoComplete="name"
          placeholder={t("profile.fullNamePlaceholder")}
          value={guestName}
          onChange={(e) => setGuestContact({ name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guestProfilePhone">{t("profile.phoneField")}</Label>
        <Input
          id="guestProfilePhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("profile.phonePlaceholder")}
          value={guestPhone}
          onChange={(e) => setGuestContact({ phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guestProfileAddress">{t("addresses.fullAddressField")}</Label>
        <Input
          id="guestProfileAddress"
          autoComplete="street-address"
          placeholder={t("home.addressPlaceholder")}
          value={guestAddress}
          onChange={(e) => setGuestContact({ address: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guestProfileZone">{t("home.deliveryZoneLabel")}</Label>
        <select
          id="guestProfileZone"
          value={guestZoneId ?? ""}
          onChange={(e) => setGuestContact({ zoneId: e.target.value || null })}
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
    </div>
  );
}
