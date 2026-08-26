import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Bell, LogIn, LogOut, Store } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { isNativePlatform, getPushNotificationCapability } from "@/lib/capabilities";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { WELCOME_SEEN_KEY } from "@/components/WelcomeGate";
import { BRAND } from "@/config/brand";
import { CONTACT } from "@/config/contact";

/**
 * Задача №178 — a real, full-screen, own-URL page for what used to be
 * SiteHeader's "i" icon dialog (moved once already, into BottomTabBar's
 * "Информация" tab as a dialog, Задача №177). A dialog has no location the
 * router (or BottomTabBar's own active-tab check, which reads
 * location.pathname) can ever see as "current" — only a real route can be
 * highlighted as the active bottom tab. Content is unchanged from before:
 * same footer.tagline/workingHours/paymentInfo/deliveryPricingInfo/
 * CONTACT.email/privacy link/sign-in-out, same push-notification button.
 */
export const Route = createFileRoute("/info")({
  component: InfoPage,
  head: () => ({
    meta: [{ title: `${BRAND.name}` }],
  }),
});

function InfoPage() {
  const { t, language } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem(WELCOME_SEEN_KEY);
    toast.success(t("account.signedOutToast"));
  };
  // Native-only: getPushNotificationCapability() resolves to the unsupported
  // web stub everywhere else, so isSupported() is false there.
  const handleEnableNotifications = async () => {
    const status = await getPushNotificationCapability().requestPermission();
    if (status === "granted") {
      toast.success(t("push.grantedToast"));
    } else if (status === "denied") {
      toast.error(t("push.deniedToast"));
    }
  };
  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const brandTranslations = useTranslatedTexts([BRAND.name], language);
  const displayBrandName = brandTranslations[BRAND.name] ?? BRAND.name;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader safeAreaTop showAccountMenu={false} showCart={false} />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Store className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-serif text-3xl tracking-tight">{displayBrandName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
        </div>

        <ul className="mt-8 space-y-3 rounded-2xl border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          <li>{t("footer.workingHours")}</li>
          <li>{t("footer.paymentInfo")}</li>
          <li>{t("footer.deliveryPricingInfo")}</li>
          <li>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
              {CONTACT.email}
            </a>
          </li>
          <li>
            <Link to="/privacy" className="hover:text-foreground">
              {t("privacy.linkLabel")}
            </Link>
          </li>
        </ul>

        {isAuthenticated === true && (
          <div className="mt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="h-4 w-4" />
              {t("account.signOutFromDialog")}
            </Button>
            {isNativePlatform() && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={() => void handleEnableNotifications()}
              >
                <Bell className="h-4 w-4" />
                {t("push.enableButton")}
              </Button>
            )}
          </div>
        )}
        {isAuthenticated === false && (
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 rounded-xl"
              onClick={() => void handleSignIn()}
            >
              <LogIn className="h-4 w-4" />
              {t("common.signIn")}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
