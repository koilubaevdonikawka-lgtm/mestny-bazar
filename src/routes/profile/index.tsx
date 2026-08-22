import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { AddressesPanel } from "@/components/AddressesPanel";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { WELCOME_SEEN_KEY } from "@/components/WelcomeGate";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { Loader2, LogIn, LogOut, Package } from "lucide-react";
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl tracking-tight">{t("nav.profile")}</h1>
          <Button variant="outline" className="rounded-full" onClick={() => void handleSignOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            {t("account.signOutFromDialog")}
          </Button>
        </div>

        <Link
          to="/orders"
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <span className="font-serif text-xl">{t("nav.orders")}</span>
          </div>
        </Link>

        <div className="mt-10">
          <AddressesPanel />
        </div>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} cartIconOnly />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
