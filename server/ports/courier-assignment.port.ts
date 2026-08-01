import type { OrderDTO } from "@shared/contracts/order";

export interface CourierCandidate {
  courierId: string;
  /** Currently active (READY_FOR_DELIVERY/OUT_FOR_DELIVERY/ARRIVED) deliveries already assigned to this courier. */
  activeDeliveries: number;
}

export interface CourierAssignmentContext {
  order: OrderDTO;
  /** Only couriers currently marked available — filtering happens before the engine runs. */
  candidates: CourierCandidate[];
}

export interface CourierAssignmentResult {
  /** null is a legitimate outcome (no courier currently available) — not an error. */
  courierId: string | null;
}

/**
 * Rule Engine standard (Принцип 12) applied to a selection problem rather than a gate —
 * each rule narrows/ranks the candidate pool instead of answering allow/deny for a single
 * context, so there is no assert() here (a null result is not a failure to throw on).
 */
export interface ICourierAssignmentPolicy {
  selectCourier(context: CourierAssignmentContext): CourierAssignmentResult;
}
