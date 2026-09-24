import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/i18n/LanguageProvider";
import { useCloseOnBackButton } from "@/hooks/useCloseOnBackButton";
import { SignInMethodsList } from "@/components/auth/SignInMethodsList";

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
 * app, so every method in the list below signs a buyer in AND creates the
 * account on first use — the same "Войти"/sign-up conflation every entry
 * point in this app already relies on.
 *
 * Задача №303 — the two hand-rolled buttons (Google button + divider +
 * TelegramLoginButton) this dialog used to render inline are now
 * SignInMethodsList (src/components/auth/SignInMethodsList.tsx) — the one
 * place the actual list of methods lives, shared with AccountMenu's header
 * popover and addresses.tsx. No "Отмена": Dialog's own built-in X close
 * (top-right) plus outside-click/Escape already let the buyer back out
 * without a dedicated Cancel button — SignInMethodsList's own action
 * methods don't need an onActionSelected here either, since Google's
 * onSelect is a real page redirect that leaves this dialog behind anyway.
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
        <SignInMethodsList />
      </DialogContent>
    </Dialog>
  );
}
