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
import { Loader2, LogIn, LogOut } from "lucide-react";
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
          <ProfileInfoForm />
        </div>

        <div className="mt-10">
          <AddressesPanel />
        </div>
      </div>
    </PageShell>
  );
}

/**
 * Задача №182 — name/phone, moved here from the cart's inline checkout
 * fields. Together with AddressesPanel's default address + zone, this is
 * the complete set CheckoutService resolves server-side at order time.
 */
function ProfileInfoForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // Задача №188 — merges what used to be two permanently-visible controls
  // (always-editable fields + a single always-there "Сохранить" button)
  // into one Редактировать/Сохранить toggle: read-only by default, editable
  // once the toggle is clicked, back to read-only once saved.
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getMyProfile,
    retry: false,
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      toast.success(t("profile.savedToast"));
      setIsEditing(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("profile.saveError")),
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
    mutation.mutate({ fullName: fullName.trim(), phone: phone.trim() });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-6 space-y-4"
    >
      <h2 className="font-serif text-2xl">{t("profile.personalDataTitle")}</h2>
      {isEditing ? (
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
        </div>
      )}
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isEditing ? (
          t("profile.saveButton")
        ) : (
          t("common.edit")
        )}
      </Button>
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
