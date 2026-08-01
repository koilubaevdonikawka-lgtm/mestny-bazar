import type {
  CourierAssignmentContext,
  CourierAssignmentResult,
} from "@server/ports/courier-assignment.port";
import type { CourierAssignmentRule } from "@server/domain/courier-assignment/courier-assignment.rule";
import { CourierAssignmentOrder } from "@server/domain/courier-assignment/courier-assignment-order";

/**
 * MVP selection criteria — couriers.md §"Бизнес-логика: подбор курьера" explicitly
 * defers the exact criteria (distance, rating, ...) to an open product question. This
 * rule implements the one criterion that's actually measurable today without geolocation
 * or a rating system that don't exist yet: pick the available courier with the fewest
 * currently active deliveries, tie-broken by courierId for determinism.
 */
export class LeastLoadedAvailableCourierRule implements CourierAssignmentRule {
  readonly order = CourierAssignmentOrder.LEAST_LOADED_AVAILABLE;

  applies(_context: CourierAssignmentContext): boolean {
    return true;
  }

  evaluate(context: CourierAssignmentContext): CourierAssignmentResult {
    if (context.candidates.length === 0) {
      return { courierId: null };
    }

    const sorted = [...context.candidates].sort((a, b) => {
      if (a.activeDeliveries !== b.activeDeliveries) {
        return a.activeDeliveries - b.activeDeliveries;
      }
      return a.courierId.localeCompare(b.courierId);
    });

    return { courierId: sorted[0].courierId };
  }
}
