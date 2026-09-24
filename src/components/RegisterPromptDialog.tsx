import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useCloseOnBackButton } from "@/hooks/useCloseOnBackButton";
import { signInWithGoogle } from "@/lib/auth";
import { TelegramLoginButton } from "@/components/TelegramLoginButton";

interface RegisterPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Задача №300 — the one short, non-technical message shown wherever an
 * unauthenticated buyer hits the checkout auth wall in the cart: CartPanel's
 * own client-side gate (tapping "Оформить заказ" while signed out) and
 * useCreateOrder's cashRequiresAuthError catch (the server's own
 * belt-and-suspenders rejection — should now be effectively unreachable
 * since the client-side gate already blocks it first, kept as defense in
 * depth) both open this instead of each showing its own wording
 * (cart.missingAddressError / cart.cashRequiresAuthError were two separate,
 * longer, more technical strings). Guest checkout was removed entirely in
 * Задача №182 — there is no separate registration form anywhere in this
 * app, so the Google button reuses the exact same signInWithGoogle() every
 * other "Войти" entry point already calls (it creates the account on first
 * use, same as a sign-up).
 *
 * Задача №302 — TelegramLoginButton added next to it, same choice: no
 * separate registration form, Telegram sign-in creates the account on first
 * use too (see server/adapters/supabase/telegram-identity.repository.ts).
 * No "Отмена" — Dialog's own built-in X close (top-right) plus
 * outside-click/Escape already let the buyer back out without a dedicated
 * Cancel button.
 *
 * A Dialog, not a toast: this app has no existing precedent for a toast
 * with an action button (checked — every toast site is plain
 * success/error text), while a modal confirmation before launching an
 * external OAuth redirect is the established pattern here (see
 * CancelOrderButton/CancelUnpaidOnlineOrderButton's AlertDialog).
 */
export function RegisterPromptDialog({ open, onOpenChange }: RegisterPromptDialogProps) {
  const { t } = useTranslation();
  useCloseOnBackButton(open, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-xl">
            {t("cart.pleaseRegister")}
          </DialogTitle>
        </DialogHeader>
        <Button
          size="lg"
          className="h-12 w-full rounded-full"
          onClick={() => {
            onOpenChange(false);
            void signInWithGoogle();
          }}
        >
          {t("cart.registerButton")}
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          {t("auth.orDivider")}
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center">
          <TelegramLoginButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}
