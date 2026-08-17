import { Button } from "@/components/ui/button";
import { Loader2, RotateCw } from "lucide-react";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { useTranslation } from "@/i18n/LanguageProvider";

interface RetryPaymentButtonProps {
  order: OrderDTO;
  isPending: boolean;
  onRetry: () => void;
}

/**
 * БАГ 3 fix — shown only when the order's own ONLINE payment attempt never
 * reached a terminal success (mirrors the exact server-side gate in
 * PaymentService.retryPayment; the server re-validates all of this
 * independently and never trusts this client-side check).
 */
export function RetryPaymentButton({ order, isPending, onRetry }: RetryPaymentButtonProps) {
  const { t } = useTranslation();

  if (order.paymentMethod !== "ONLINE") return null;
  if (order.status === OrderStatus.CANCELLED) return null;
  if (order.paymentStatus === "paid" || order.paymentStatus === "refunded") return null;

  return (
    <Button disabled={isPending} onClick={onRetry} data-testid="retry-payment-button">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <RotateCw className="h-4 w-4 mr-2" />
          {t("orders.retryPaymentButton")}
        </>
      )}
    </Button>
  );
}
