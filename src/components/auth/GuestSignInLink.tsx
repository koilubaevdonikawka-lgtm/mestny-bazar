import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";
import { useTranslation } from "@/i18n/LanguageProvider";

/**
 * Optional sign-in for a guest at checkout, deliberately low-key: a plain text
 * link placed UNDER the order button, never a button above or brighter than it —
 * a prominent "Войти" read as "sign-in required" (owner's incognito test). Opens
 * the same Google/Telegram list as the header's AccountMenu.
 */
export function GuestSignInLink() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <p className="mt-2 text-center text-sm text-muted-foreground">
      {t("cart.guestHaveAccount")}{" "}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="underline underline-offset-2 hover:text-foreground"
            data-testid="guest-sign-in-link"
          >
            {t("cart.guestSignInLink")}
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-64">
          <p className="mb-3 text-sm font-medium text-foreground">{t("auth.chooseMethod")}</p>
          <SignInMethodsList onActionSelected={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    </p>
  );
}
