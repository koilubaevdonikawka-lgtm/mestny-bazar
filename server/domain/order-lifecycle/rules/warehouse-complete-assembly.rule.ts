import type {
  OrderLifecycleActor,
  OrderLifecycleContext,
  OrderLifecycleResult,
} from "@server/ports/order-lifecycle.port";
import type { OrderLifecycleRule } from "@server/domain/order-lifecycle/order-lifecycle.rule";
import { OrderLifecycleOrder } from "@server/domain/order-lifecycle/order-lifecycle-order";
import { OrderStatus } from "@shared/contracts/order";

function isWarehouse(actor: OrderLifecycleActor): boolean {
  return actor.roles?.includes("warehouse") ?? false;
}

/** Warehouse completes assembly: ASSEMBLING → READY_FOR_DELIVERY. */
export class WarehouseCompleteAssemblyRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "warehouse_complete_assembly" &&
      context.targetStatus === OrderStatus.READY_FOR_DELIVERY
    );
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isWarehouse(context.actor)) {
      return {
        allowed: false,
        denialCode: "WAREHOUSE_ROLE_REQUIRED",
        message: "Warehouse role is required to complete assembly",
      };
    }

    if (context.currentStatus !== OrderStatus.ASSEMBLING) {
      return {
        allowed: false,
        denialCode: "INVALID_COMPLETE_ASSEMBLY_TRANSITION",
        message: "Only orders in assembly can be marked ready for delivery",
      };
    }

    return { allowed: true };
  }
}
