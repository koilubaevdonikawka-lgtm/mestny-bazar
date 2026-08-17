import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { formatCountdown, getCancellationRemainingMs } from "@shared/lib/order-cancellation";

const SELF_CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.CREATED, OrderStatus.PAID];

/**
 * Informational only — staff cannot act on this window, it exists so admin/
 * warehouse understand why an order might disappear from view on its own
 * (orders.md: "должен явно показывать администратору и складу, что заказ
 * ещё может быть отменён покупателем самостоятельно"). Ticking display
 * mirrors CancelOrderButton's own client-side countdown; the server
 * independently re-checks the window on every relevant action.
 */
export function CancellationWindowBadge({ order }: { order: OrderDTO }) {
  const [remainingMs, setRemainingMs] = useState(() => getCancellationRemainingMs(order.createdAt));

  useEffect(() => {
    setRemainingMs(getCancellationRemainingMs(order.createdAt));
    const interval = setInterval(() => {
      setRemainingMs(getCancellationRemainingMs(order.createdAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  if (!SELF_CANCELLABLE_STATUSES.includes(order.status)) return null;
  if (remainingMs <= 0) return null;

  return (
    <Badge variant="outline" title="Покупатель может отменить заказ самостоятельно">
      Окно отмены: {formatCountdown(remainingMs)}
    </Badge>
  );
}
