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

/** Warehouse starts assembly: CONFIRMED → ASSEMBLING. */
export class WarehouseStartAssemblyRule implements OrderLifecycleRule {
  readonly order = OrderLifecycleOrder.ROLE_PERMISSION;

  applies(context: OrderLifecycleContext): boolean {
    return (
      context.reason === "warehouse_start_assembly" &&
      context.targetStatus === OrderStatus.ASSEMBLING
    );
  }

  evaluate(context: OrderLifecycleContext): OrderLifecycleResult {
    if (!isWarehouse(context.actor)) {
      return {
        allowed: false,
        denialCode: "WAREHOUSE_ROLE_REQUIRED",
        message: "Warehouse role is required to start assembly",
      };
    }

    if (context.currentStatus !== OrderStatus.CONFIRMED) {
      return {
        allowed: false,
        denialCode: "INVALID_START_ASSEMBLY_TRANSITION",
        message: "Only confirmed orders can be moved to assembly",
      };
    }

    return { allowed: true };
  }
}
