import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface AppInfoDialogProps {
  /** The exact clickable trigger element — this component owns only the
   * dialog itself, not its trigger's visuals, so each caller (previously
   * SiteHeader's small "i" icon button, now BottomTabBar's "Информация" tab,
   * Задача №177) supplies its own. */
  trigger: ReactNode;
}

/**
 * Задача №177 — extracted out of SiteHeader (was gated there on
 * `cartIconOnly`) so BottomTabBar's new "Информация" tab can open the exact
 * same brand/contacts/sign-in-out dialog, unchanged, instead of duplicating
 * this logic in a second place. Content itself is unchanged from before —
 * same footer.tagline/workingHours/paymentInfo/deliveryPricingInfo/
 * CONTACT.email/privacy link/sign-in-out, same push-notification button.
 */
export function AppInfoDialog({ trigger }: AppInfoDialogProps) {
  const { t, language } = useTranslation();
  const { isAuthenticated } = useSupabaseSession();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem(WELCOME_SEEN_KEY);
    toast.success(t("account.signedOutToast"));
    setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
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
          <li>
            <Link to="/privacy" className="hover:text-foreground" onClick={() => setOpen(false)}>
              {t("privacy.linkLabel")}
            </Link>
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
            {isNativePlatform() && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => void handleEnableNotifications()}
              >
                <Bell className="h-4 w-4" />
                {t("push.enableButton")}
              </Button>
            )}
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
  );
}
