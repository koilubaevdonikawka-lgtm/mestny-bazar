import { useEffect, useState } from "react";
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
import { formatCountdown, getCancellationRemainingMs } from "@shared/lib/order-cancellation";
import { useTranslation } from "@/i18n/LanguageProvider";

const CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PAID];

interface CancelOrderButtonProps {
  order: OrderDTO;
  isPending: boolean;
  onConfirm: () => void;
}

/**
 * Countdown is display-only, computed client-side from order.createdAt purely
 * for UX — the server independently re-validates the same window against its
 * own clock on every cancel request (never trusts this timer).
 */
export function CancelOrderButton({ order, isPending, onConfirm }: CancelOrderButtonProps) {
  const { t } = useTranslation();
  const [remainingMs, setRemainingMs] = useState(() => getCancellationRemainingMs(order.createdAt));

  useEffect(() => {
    setRemainingMs(getCancellationRemainingMs(order.createdAt));
    const interval = setInterval(() => {
      setRemainingMs(getCancellationRemainingMs(order.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  if (!CANCELLABLE_STATUSES.includes(order.status)) return null;
  if (remainingMs <= 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending} data-testid="cancel-order-button">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("orders.cancelButtonWithCountdown", { countdown: formatCountdown(remainingMs) })
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("orders.cancelConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("orders.cancelConfirmDescription", { number: order.orderNumber })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("orders.cancelDeny")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("orders.cancelConfirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
