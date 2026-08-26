import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { useTranslation } from "@/i18n/LanguageProvider";

interface CancelUnpaidOnlineOrderButtonProps {
  order: OrderDTO;
  isPending: boolean;
  onConfirm: () => void;
}

/**
 * Задача №172 — cancellation button for a customer who returned from the
 * Finik payment page without completing payment. Deliberately NOT
 * CancelOrderButton (that one is gated behind FEATURE_CUSTOMER_CANCELLATION,
 * currently off, and a 2-minute window) — this mirrors
 * CustomerCancelUnpaidOnlineOrderRule's own server-side gate instead, which
 * has neither.
 */
export function CancelUnpaidOnlineOrderButton({
  order,
  isPending,
  onConfirm,
}: CancelUnpaidOnlineOrderButtonProps) {
  const { t } = useTranslation();

  if (order.paymentMethod !== "ONLINE") return null;
  if (order.status !== OrderStatus.CREATED) return null;
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isPending}
          data-testid="cancel-unpaid-online-order-button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("orderSuccess.cancelUnpaidOrderButton")
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("orderSuccess.cancelUnpaidOrderConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("orderSuccess.cancelUnpaidOrderConfirmDescription", { number: order.orderNumber })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("orderSuccess.cancelUnpaidOrderConfirmDeny")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t("orderSuccess.cancelUnpaidOrderConfirmAction")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
