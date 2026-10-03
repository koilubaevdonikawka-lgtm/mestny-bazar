import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listDeliveryZones } from "@/api/delivery-zone";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useTranslation } from "@/i18n/LanguageProvider";
import { validateGuestContact } from "@/lib/guest-contact-validation";

/**
 * Задача №314 — what a signed-out buyer fills in to check out as a guest
 * (CartPanel and checkout.quick-buy both render this): delivery address and
 * phone, both required (useCreateOrder validates them before sending,
 * CheckoutService again server-side), plus the delivery zone, optional —
 * it only determines the delivery fee, same as the guest form before
 * Задача №182. Values live in useCheckoutStore (guestPhone/guestAddress/
 * guestZoneId) so the caller's submit handler reads the same draft.
 *
 * Titled "Оформление без регистрации" so a guest sees at once that no account
 * is needed; the optional sign-in is a quiet link under the order button
 * (GuestSignInLink), not a button up here. `showErrors` — set by the caller
 * once the guest tried to submit — highlights the missing/invalid required
 * fields instead of the order button being hidden.
 */
export function GuestCheckoutFields({ showErrors = false }: { showErrors?: boolean }) {
  const { t } = useTranslation();
  const { guestPhone, guestAddress, guestZoneId, setGuestContact } = useCheckoutStore();
  const { addressValid, phoneValid } = validateGuestContact({
    address: guestAddress,
    phone: guestPhone,
  });
  const addressError = showErrors && !addressValid;
  const phoneError = showErrors && !phoneValid;

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="mt-3 space-y-3" data-testid="guest-checkout-fields">
      <h2 className="font-serif text-lg tracking-tight">{t("cart.guestCheckoutTitle")}</h2>

      <div className="space-y-1.5">
        <Label htmlFor="guest-address" className="text-sm font-medium">
          {t("home.addressFieldLabel")} *
        </Label>
        <Input
          id="guest-address"
          required
          autoComplete="street-address"
          placeholder={t("home.addressPlaceholder")}
          value={guestAddress}
          onChange={(e) => setGuestContact({ address: e.target.value })}
          aria-invalid={addressError}
          aria-describedby={addressError ? "guest-address-error" : undefined}
          className={`rounded-xl ${addressError ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {addressError ? (
          <p id="guest-address-error" className="text-xs font-medium text-destructive">
            {t("home.enterFullAddressError")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("home.addressHint")}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guest-phone" className="text-sm font-medium">
          {t("home.phoneLabel")} *
        </Label>
        <Input
          id="guest-phone"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={t("home.phonePlaceholder")}
          value={guestPhone}
          onChange={(e) => setGuestContact({ phone: e.target.value })}
          aria-invalid={phoneError}
          aria-describedby={phoneError ? "guest-phone-error" : undefined}
          className={`rounded-xl ${phoneError ? "border-destructive ring-1 ring-destructive" : ""}`}
        />
        {phoneError && (
          <p id="guest-phone-error" className="text-xs font-medium text-destructive">
            {t("home.invalidPhoneError")}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="guest-zone" className="text-sm font-medium">
          {t("home.deliveryZoneLabel")}
        </Label>
        <select
          id="guest-zone"
          value={guestZoneId ?? ""}
          onChange={(e) => setGuestContact({ zoneId: e.target.value || null })}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("home.zoneNotSelected")}</option>
          {(deliveryZones ?? []).map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{t("home.deliveryZoneHint")}</p>
      </div>
    </section>
  );
}
