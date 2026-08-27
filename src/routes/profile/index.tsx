import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AddressesPanel } from "@/components/AddressesPanel";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { WELCOME_SEEN_KEY } from "@/components/WelcomeGate";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { getMyProfile, updateMyProfile } from "@/api/profile";
import { createAddress, deleteAddress, listAddresses, updateAddress } from "@/api/addresses";
import { listDeliveryZones } from "@/api/delivery-zone";
import { Loader2, LogIn, LogOut, Trash2 } from "lucide-react";
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

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem(WELCOME_SEEN_KEY);
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

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="max-w-md mx-auto text-center py-24">
          <div className="mx-auto h-14 w-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl tracking-tight">{t("nav.profile")}</h1>
          <p className="mt-3 text-muted-foreground">{t("addresses.signInPrompt")}</p>
          <Button size="lg" className="mt-6 h-12 rounded-full" onClick={() => void handleSignIn()}>
            {t("common.signIn")}
          </Button>
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
  const [fullAddress, setFullAddress] = useState("");
  const [zoneId, setZoneId] = useState("");

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
    setFullAddress(defaultAddress?.fullAddress ?? "");
    setZoneId(defaultAddress?.zoneId ?? "");
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
            fullAddress: fullAddress.trim(),
            zoneId: zoneId || undefined,
          })
        : createAddress({
            fullAddress: fullAddress.trim(),
            zoneId: zoneId || undefined,
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
          <div className="space-y-2">
            <Label htmlFor="profileDefaultAddress">{t("addresses.fullAddressField")}</Label>
            <Input
              id="profileDefaultAddress"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
            />
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
      <div className="flex gap-3">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            t("profile.saveButton")
          ) : (
            t("common.edit")
          )}
        </Button>
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
