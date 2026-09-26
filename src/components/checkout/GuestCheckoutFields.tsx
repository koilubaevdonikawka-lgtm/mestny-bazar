import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountMenu } from "@/components/AccountMenu";
import { listDeliveryZones } from "@/api/delivery-zone";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useTranslation } from "@/i18n/LanguageProvider";

/**
 * Задача №314 — what a signed-out buyer fills in to check out as a guest
 * (CartPanel and checkout.quick-buy both render this): delivery address and
 * phone, both required (useCreateOrder validates them before sending,
 * CheckoutService again server-side), plus the delivery zone, optional —
 * it only determines the delivery fee, same as the guest form before
 * Задача №182. Values live in useCheckoutStore (guestPhone/guestAddress/
 * guestZoneId) so the caller's submit handler reads the same draft.
 *
 * Signing in stays available but optional: AccountMenu's own "Войти"
 * popover (the same Google/Telegram SignInMethodsList as the header).
 */
export function GuestCheckoutFields() {
  const { t } = useTranslation();
  const { guestPhone, guestAddress, guestZoneId, setGuestContact } = useCheckoutStore();

  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="mt-3 space-y-3" data-testid="guest-checkout-fields">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{t("cart.guestSignInHint")}</span>
        <AccountMenu />
      </div>

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
          className="rounded-xl"
        />
        <p className="text-xs text-muted-foreground">{t("home.addressHint")}</p>
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
          className="rounded-xl"
        />
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
