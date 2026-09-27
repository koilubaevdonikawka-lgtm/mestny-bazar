import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressesPanel } from "@/components/AddressesPanel";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfile, updateMyProfile } from "@/api/profile";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/api/addresses";
import { listDeliveryZones } from "@/api/delivery-zone";
import { LocationPickerDialog } from "@/components/checkout/LocationPickerDialog";
import { AccountMenu } from "@/components/AccountMenu";
import { GuestProfileCard } from "@/components/GuestProfileCard";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { Loader2, LogOut, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/LanguageProvider";
import { BRAND } from "@/config/brand";

/**
 * Third step toward the mobile bottom-tab-bar navigation
 * (Главная/Каталог/Корзина/Профиль, see cart.tsx and catalog.tsx for the
 * first two steps) — minimal scope confirmed with the product owner:
 * addresses (real, embedded) + sign-in/out + a link to orders, not a
 * full account-hub with order history/language settings inline.
 *
 * Addresses reuse AddressesPanel as-is (extracted from
 * /profile/addresses.tsx in this same task, same pattern as CartPanel
 * for /cart) — no CRUD logic duplicated. Sign-in/out reuses the exact
 * same handleSignIn/handleSignOut pattern already used in
 * AccountMenu.tsx/SiteHeader.tsx (signInWithGoogle() /
 * supabase.auth.signOut() + clearing WELCOME_SEEN_KEY), not a new
 * mechanism. /profile/addresses stays reachable too — an additional
 * entry point, same as /cart/ /catalog coexisting with their older
 * counterparts.
 *
 * Signed out, the page shows GuestProfileCard instead of a sign-in wall:
 * name/phone/address kept in this device's localStorage only (the same
 * useCheckoutStore guest fields the cart prefills from), never the server.
 */
export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function ProfilePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success(t("account.signedOutToast"));
  };

  if (isAuthenticated === null) {
    return (
      <PageShell>
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  // Guest: a device-local profile (GuestProfileCard, localStorage) instead of
  // a sign-in wall — signing in stays one tap away via AccountMenu's own
  // Google/Telegram list, same as the cart's guest form.
  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-4xl tracking-tight">{t("nav.profile")}</h1>
            <AccountMenu />
          </div>
          <div className="mt-10">
            <GuestProfileCard />
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Задача №188 — the search bar this page's SiteHeader used to show
            is gone; sign-out and a lightweight link to order history now
            live up top instead, replacing the old full-card "Заказы" link
            below (same destination, /orders — just one way to reach it now,
            not two). */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl tracking-tight">{t("nav.profile")}</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => void handleSignOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("account.signOutFromDialog")}
            </Button>
            <Button asChild variant="link">
              <Link to="/orders">{t("profile.orderHistoryLink")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <ProfileAndDefaultAddressCard />
        </div>

        <div className="mt-10">
          <AddressesPanel />
        </div>
      </div>
    </PageShell>
  );
}

/**
 * Задача №182/188 — name/phone, together with AddressesPanel's default
 * address + zone, is the complete set CheckoutService resolves server-side
 * at order time.
 *
 * Задача №189 — merges the personal-data card with the DEFAULT address
 * (text + zone only, not the full label/city/district/notes/map-picker
 * form) into one card with one Редактировать/Сохранить toggle for both.
 * Deliberately scoped to the default address only: with more than one saved
 * address there is no single sane "edit" target for a single shared toggle
 * button, so any OTHER (non-default) addresses stay their own list further
 * down in AddressesPanel, each with its own per-row controls, untouched.
 *
 * "Удалить" here removes the default address itself (profile name/phone
 * are unaffected — they're a different entity, can't be "deleted" the same
 * way); only shown once a default address actually exists, and hidden
 * while editing (same as AddressesPanel's own per-row pattern).
 */
function ProfileAndDefaultAddressCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  // Задача №190 — city reuses AddressDTO.city (already existed, was never
  // wired into this card before — only AddressesPanel's own separate form
  // used it). Country isn't a field at all: the platform only ever
  // delivers within Kyrgyzstan (see order-display.ts's own hardcoded
  // ", Кыргызстан" suffix) — shown as static text below, not state.
  const [city, setCity] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [zoneId, setZoneId] = useState("");
  // Задача №195 — "Отметить на карте" here permanently updates the saved
  // Address (unlike the same button/dialog in the cart, which only ever
  // sets a one-off, this-order-only override in checkoutStore).
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    retry: false,
  });
  const { data: addresses, isLoading: isAddressesLoading } = useQuery({
    queryKey: ["addresses", "list"],
    queryFn: listAddresses,
    retry: false,
  });
  const { data: deliveryZones } = useQuery({
    queryKey: ["delivery", "zones"],
    queryFn: listDeliveryZones,
    staleTime: 5 * 60 * 1000,
  });

  const defaultAddress = addresses?.find((a) => a.isDefault) ?? null;

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  useEffect(() => {
    setCity(defaultAddress?.city ?? "");
    setFullAddress(defaultAddress?.fullAddress ?? "");
    setZoneId(defaultAddress?.zoneId ?? "");
    setLatitude(defaultAddress?.latitude ?? null);
    setLongitude(defaultAddress?.longitude ?? null);
    // Re-syncs only when which address is the default one actually changes
    // (e.g. after a save) — not on every unrelated addresses-list refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAddress?.id]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    void queryClient.invalidateQueries({ queryKey: ["addresses", "list"] });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateMyProfile({ fullName: fullName.trim(), phone: phone.trim() });
      // Задача №189 — two separate API calls, one after another, for one
      // customer-visible click: no combined profile+address endpoint
      // exists (nor should one — Ports & Adapters keeps Profile and
      // Address as distinct repositories/entities), but the UI only ever
      // shows a single loading state and a single success/error outcome.
      return defaultAddress
        ? updateAddress({
            id: defaultAddress.id,
            city: city.trim() || undefined,
            fullAddress: fullAddress.trim(),
            zoneId: zoneId || undefined,
            latitude,
            longitude,
          })
        : createAddress({
            city: city.trim() || undefined,
            fullAddress: fullAddress.trim(),
            zoneId: zoneId || undefined,
            latitude,
            longitude,
            isDefault: true,
          });
    },
    onSuccess: () => {
      invalidateAll();
      toast.success(t("profile.savedToast"));
      setIsEditing(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("profile.saveError")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      invalidateAll();
      toast.success(t("addresses.deletedToast"));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("addresses.deleteError")),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing) {
      // Details saved locally while browsing as a guest pre-fill only the
      // fields the account doesn't have yet — nothing is written to the
      // server until the customer reviews them and presses Сохранить.
      const guest = useCheckoutStore.getState();
      if (!fullName) setFullName(guest.guestName);
      if (!phone) setPhone(guest.guestPhone);
      if (!defaultAddress) {
        if (!fullAddress) setFullAddress(guest.guestAddress);
        if (!zoneId) setZoneId(guest.guestZoneId ?? "");
      }
      setIsEditing(true);
      return;
    }
    if (fullName.trim().length < 2) {
      toast.error(t("profile.nameTooShortError"));
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      toast.error(t("profile.phoneTooShortError"));
      return;
    }
    if (fullAddress.trim().length < 5) {
      toast.error(t("addresses.tooShortError"));
      return;
    }
    saveMutation.mutate();
  };

  if (isProfileLoading || isAddressesLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const zoneName = deliveryZones?.find((z) => z.id === defaultAddress?.zoneId)?.name;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-6 space-y-4"
    >
      <h2 className="font-serif text-2xl">{t("profile.personalDataAndAddressTitle")}</h2>
      {isEditing ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profileFullName">{t("profile.fullNameField")}</Label>
              <Input
                id="profileFullName"
                placeholder={t("profile.fullNamePlaceholder")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePhone">{t("profile.phoneField")}</Label>
              <Input
                id="profilePhone"
                type="tel"
                placeholder={t("profile.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          {/* Задача №190 — the single "Адрес" field split into three:
              country (static — see the field-level comment above), city/
              district (reuses AddressDTO.city), and the detail address
              (reuses fullAddress, with the requested verbatim placeholder). */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profileCountry">{t("profile.countryField")}</Label>
              <Input id="profileCountry" value={t("profile.countryValue")} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileCity">{t("profile.cityOrDistrictField")}</Label>
              <Input id="profileCity" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileDefaultAddress">{t("addresses.fullAddressField")}</Label>
            <Input
              id="profileDefaultAddress"
              placeholder={t("profile.detailAddressPlaceholder")}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
            {latitude != null && longitude != null && (
              <p className="text-xs text-muted-foreground">{t("addresses.mapPointSet")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="profileDefaultZone">{t("home.deliveryZoneLabel")}</Label>
            <select
              id="profileDefaultZone"
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
            <p className="font-medium">{fullName || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("profile.phoneField")}</p>
            <p className="font-medium">{phone || "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("profile.countryField")}</p>
            <p className="font-medium">{t("profile.countryValue")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("profile.cityOrDistrictField")}</p>
            <p className="font-medium">{city || "—"}</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-sm text-muted-foreground">{t("addresses.fullAddressField")}</p>
            <p className="font-medium">{defaultAddress?.fullAddress || "—"}</p>
            {zoneName && (
              <p className="text-sm text-muted-foreground">
                {t("addresses.zoneDisplay", { zoneName })}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            t("profile.saveButton")
          ) : (
            t("common.edit")
          )}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-9 whitespace-normal"
            onClick={() => setMapDialogOpen(true)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            {t("cart.markOnMapButton")}
          </Button>
        )}
        {defaultAddress && !isEditing && (
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(defaultAddress.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("common.delete")}
          </Button>
        )}
      </div>
      <LocationPickerDialog
        open={mapDialogOpen}
        onOpenChange={setMapDialogOpen}
        onConfirm={(location) => {
          setLatitude(location.latitude);
          setLongitude(location.longitude);
          setFullAddress((prev) => prev.trim() || location.address || prev);
        }}
      />
    </form>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Задача №188 — no search bar on /profile; replaced up top by the
          sign-out/order-history controls (see ProfilePage below). */}
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} showSearch={false} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
