import { useState } from "react";
import { useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { CartDrawer } from "./CartDrawer";
import { AccountMenu } from "./AccountMenu";
import { SearchBar } from "./SearchBar";
import { ArrowLeft, Info, LogIn, LogOut, Store } from "lucide-react";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useTranslatedTexts } from "@/hooks/useTranslatedTexts";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
import { signInWithGoogle } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { WELCOME_SEEN_KEY } from "@/components/WelcomeGate";
import { BRAND } from "@/config/brand";
import { CONTACT } from "@/config/contact";

interface SiteHeaderProps {
  /**
   * Opt-in only — defaults to false so every existing caller (admin, seller,
   * courier panels) keeps its exact current header, unchanged. Only the
   * customer-facing shopping pages pass `true`.
   */
  showLanguageSwitcher?: boolean;
  /**
   * Search and cart default to `true` (existing universal behavior for every
   * current caller) — unlike showLanguageSwitcher, these are opt-**out**,
   * not opt-in, so no customer-facing call site needs to change. Only the
   * Admin Platform passes `false`: search is bound to the buyer catalog's
   * useSearchStore and cart is buyer-checkout-only — neither has any
   * meaning inside the admin panel (docs/admin-platform/ADMIN_PLATFORM_MASTER_SPEC.md).
   */
  showSearch?: boolean;
  showCart?: boolean;
  /**
   * Adds safe-area top padding for the native/Capacitor shell (status bar /
   * notch). Zero-effect on regular desktop/web (env() resolves to 0), but
   * kept opt-in — same reasoning as showLanguageSwitcher — so admin/seller/
   * courier headers stay byte-for-byte unchanged.
   */
  safeAreaTop?: boolean;
  /**
   * Hides AccountMenu's "Войти" call-to-action for signed-out visitors —
   * sign-in is now offered once via WelcomeGate on first visit instead of a
   * permanent header button (Часть 2). Opt-in so admin/seller/courier pages
   * sharing this same header keep their existing behavior untouched.
   */
  hideSignInButton?: boolean;
  /**
   * Fully hides AccountMenu — both the signed-out "Войти" CTA and the
   * signed-in avatar/dropdown (no person-silhouette icon at all, regardless
   * of auth state — every customer-facing page passes this now, per the
   * comprehensive user panel task). Opt-out (default true), so any
   * non-customer caller keeps its icon.
   */
  showAccountMenu?: boolean;
  /** Cart trigger shows the icon only, no "Ваша корзина" label (Часть 1 of
   * the comprehensive user panel task — every customer-facing page passes
   * this now). Opt-in so any non-customer caller keeps the labelled button. */
  cartIconOnly?: boolean;
}

export function SiteHeader({
  showLanguageSwitcher = false,
  showSearch = true,
  showCart = true,
  safeAreaTop = false,
  hideSignInButton = false,
  showAccountMenu = true,
  cartIconOnly = false,
}: SiteHeaderProps = {}) {
  const { t, language } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const router = useRouter();
  const navigate = useNavigate();
  const [infoOpen, setInfoOpen] = useState(false);

  // Every customer-facing page passes showAccountMenu={false} (avatar/dropdown
  // fully hidden there) — this "Информация" dialog is currently the only
  // visible place left for a signed-in customer to sign out at all, so it
  // reuses AccountMenu's exact handleSignOut pattern instead of inventing one.
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem(WELCOME_SEEN_KEY);
    toast.success(t("account.signedOutToast"));
    setInfoOpen(false);
  };
  // Same reasoning as handleSignOut above, mirroring AccountMenu's
  // handleSignIn exactly — this dialog is the only sign-in entry point left
  // on customer pages too. Not closed on click: signInWithGoogle() navigates
  // away to Google and back, so there's nothing left open to close by the
  // time control would return here.
  const handleSignIn = async () => {
    await signInWithGoogle();
  };
  // Задача №1 — standard "← Назад" replacing the previous Home-icon button:
  // real back navigation when there's an in-app previous screen to return
  // to (true history.back(), not just a link to "/"), falling back to the
  // home page only when there's nothing to go back to (direct/external
  // entry). Same pattern already used on the product page (Этап №7/8).
  const canGoBack = useCanGoBack();
  // "Информация" modal (Этап: логотип из шапки в модалку) — same content
  // SiteFooter's contacts column already shows (footer.tagline/
  // workingHours/paymentInfo/deliveryPricingInfo, CONTACT.email), reused
  // as-is rather than duplicated with new translation strings. Gated on
  // cartIconOnly — the existing flag every customer-facing page already
  // passes (per its own doc comment below) and no non-customer page does,
  // so this appears everywhere the customer header does without needing to
  // touch any of those route files individually.
  const brandTranslations = useTranslatedTexts([BRAND.name], language);
  const displayBrandName = brandTranslations[BRAND.name] ?? BRAND.name;

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60 ${safeAreaTop ? "pt-safe" : ""}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Этап №7 навигационного аудита — the only site-wide, always-visible
            way back on mobile (nav below is `lg:` only). Gated on the same
            `showSearch` flag as the rest of this customer-storefront chrome,
            so Admin Platform pages that already opt out of it
            (`showSearch={false}`) don't get it either. */}
        {showSearch && (
          <button
            type="button"
            onClick={() => {
              if (canGoBack) {
                router.history.back();
              } else {
                void navigate({ to: "/" });
              }
            }}
            aria-label={t("common.back")}
            className="flex h-11 shrink-0 items-center gap-1 rounded-full px-2 text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">{t("common.back")}</span>
          </button>
        )}
        {/* flex-1 spacer kept even when search is hidden (Admin Platform) — it's
            what pushes nav/account/cart to the right; only its contents are
            conditional, so hiding search doesn't collapse the header layout. */}
        <div className="relative flex-1 max-w-xl">{showSearch && <SearchBar />}</div>
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          <a href="#categories" className="hover:text-primary transition-colors">
            {t("nav.categories")}
          </a>
          <a href="#products" className="hover:text-primary transition-colors">
            {t("home.productsHeading")}
          </a>
          <a href="#delivery" className="hover:text-primary transition-colors">
            {t("header.deliveryLink")}
          </a>
        </nav>
        {showLanguageSwitcher && <LanguageSwitcher />}
        {showAccountMenu && <AccountMenu hideSignInCta={hideSignInButton} />}
        {cartIconOnly && (
          <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={t("footer.contactsHeading")}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
              >
                <Info className="h-5 w-5" />
                {/* Only visible sign-in status cue on customer pages now that
                    showAccountMenu={false} hides the avatar entirely — a
                    small dot, not a second AccountMenu. Absence of the dot
                    (guest) is itself the "not signed in" signal, same pattern
                    as any presence indicator. */}
                {isAuthenticated === true && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"
                  />
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Store className="h-4 w-4" />
                  </span>
                  <DialogTitle className="font-serif text-xl">{displayBrandName}</DialogTitle>
                </div>
                <DialogDescription>{t("footer.tagline")}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t("footer.workingHours")}</li>
                <li>{t("footer.paymentInfo")}</li>
                <li>{t("footer.deliveryPricingInfo")}</li>
                <li>
                  <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">
                    {CONTACT.email}
                  </a>
                </li>
              </ul>
              {isAuthenticated === true && (
                <div className="mt-2 border-t border-border/60 pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => void handleSignOut()}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("account.signOutFromDialog")}
                  </Button>
                </div>
              )}
              {isAuthenticated === false && (
                <div className="mt-2 border-t border-border/60 pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => void handleSignIn()}
                  >
                    <LogIn className="h-4 w-4" />
                    {t("common.signIn")}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
        {showCart && <CartDrawer iconOnly={cartIconOnly} />}
      </div>
    </header>
  );
}
