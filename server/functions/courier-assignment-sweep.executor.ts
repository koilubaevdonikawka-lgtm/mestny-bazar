import { getServices } from "@server/di/container";
import { OrderStatus } from "@shared/contracts/order";
import { logger } from "@shared/observability/logger";

export interface SweepUnassignedReadyOrdersResult {
  scanned: number;
}

/**
 * Задача №140 — proactive backstop for courier auto-assignment, invoked on a
 * schedule (Cloudflare Cron Trigger via Nitro's `scheduledTasks`, see
 * tasks/courier/sweep-unassigned.ts) rather than relying solely on either of
 * the two other assignment triggers: WarehouseOrderService.completeAssembly()
 * (fires once, right when an order becomes READY_FOR_DELIVERY — but no
 * courier may be active/available yet at that exact moment) or an admin
 * happening to read the order list/detail (OrderLifecycleCascadeService's
 * sweep, Задача №138's finding — previously the ONLY trigger at all, with no
 * time bound). This catches whatever those miss: a courier added or made
 * available after assembly completed, a transient failure in the
 * completeAssembly() attempt, etc.
 *
 * Reuses OrderLifecycleCascadeService.sweep() — the exact same,
 * already-idempotent logic AdminOrderService's reads already trigger — so
 * this introduces no new assignment policy, only a new caller of the
 * existing one. assignCourier() itself is a safe no-op when the order
 * already has a courier (checked first thing, before any query), so running
 * this alongside the completeAssembly() trigger or a concurrent admin read
 * cannot double-assign (server/adapters/supabase/order.repository.ts's
 * assignCourier() also CAS-guards the write itself:
 * `.is("assigned_courier_id", null)`).
 */
export async function executeSweepUnassignedReadyOrders(): Promise<SweepUnassignedReadyOrdersResult> {
  const { orders, orderCascadeService } = getServices();

  const readyOrders = await orders.listByStatuses([OrderStatus.READY_FOR_DELIVERY]);
  const unassigned = readyOrders.filter((order) => !order.assignedCourierId);

  await orderCascadeService.sweep(unassigned);

  logger.info("courier:assignment-sweep-completed", { scanned: unassigned.length });

  return { scanned: unassigned.length };
}
