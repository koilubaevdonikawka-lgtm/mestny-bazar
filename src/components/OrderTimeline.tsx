import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { cn } from "@/lib/utils";
import {
  formatOrderStatus,
  getTimelineStepState,
  ORDER_TIMELINE_SEQUENCE,
} from "@/lib/order-display";
import { Check, Circle, X } from "lucide-react";

interface OrderTimelineProps {
  order: OrderDTO;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const isCancelled = order.status === OrderStatus.CANCELLED;

  return (
    <section className="mt-6 rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="font-serif text-2xl mb-6">Статус заказа</h2>

      {isCancelled && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Заказ отменён
        </div>
      )}

      <ol className="relative space-y-0">
        {ORDER_TIMELINE_SEQUENCE.map((step, index) => {
          const state = getTimelineStepState(order.status, step);
          const isLast = index === ORDER_TIMELINE_SEQUENCE.length - 1;

          return (
            <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[15px] top-8 bottom-0 w-px",
                    state === "completed" ? "bg-primary/40" : "bg-border",
                  )}
                  aria-hidden
                />
              )}

              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  state === "completed" && "border-primary bg-primary text-primary-foreground",
                  state === "current" &&
                    "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                  state === "upcoming" && "border-border bg-background text-muted-foreground",
                  state === "cancelled" && "border-border/60 bg-muted text-muted-foreground",
                )}
                aria-current={state === "current" ? "step" : undefined}
              >
                {state === "completed" && <Check className="h-4 w-4" strokeWidth={2.5} />}
                {state === "current" && <Circle className="h-3 w-3 fill-current" />}
                {state === "upcoming" && <Circle className="h-3 w-3" />}
                {state === "cancelled" && <X className="h-3.5 w-3.5 opacity-50" />}
              </div>

              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    "font-medium leading-tight",
                    state === "current" && "text-primary",
                    state === "completed" && "text-foreground",
                    (state === "upcoming" || state === "cancelled") && "text-muted-foreground",
                  )}
                >
                  {formatOrderStatus(step)}
                </p>
                {state === "current" && !isCancelled && (
                  <p className="mt-1 text-sm text-muted-foreground">Текущий этап</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
