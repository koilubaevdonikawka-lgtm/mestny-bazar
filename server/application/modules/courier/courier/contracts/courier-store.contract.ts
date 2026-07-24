import type {
  Courier,
  CourierAssignment,
  DeliveryRoute,
} from "@server/application/modules/courier/courier/models";

/** Courier persistence contract — implemented by infrastructure adapters. */
export interface ICourierStore {
  saveCourier(courier: Courier): Promise<void>;
  updateCourier(courier: Courier): Promise<void>;
  findCourierById(courierId: string): Promise<Courier | null>;

  saveAssignment(assignment: CourierAssignment): Promise<void>;
  updateAssignment(assignment: CourierAssignment): Promise<void>;
  findAssignmentById(assignmentId: string): Promise<CourierAssignment | null>;
  findAssignmentsByOrderId(orderId: string): Promise<readonly CourierAssignment[]>;

  saveRoute(route: DeliveryRoute): Promise<void>;
  updateRoute(route: DeliveryRoute): Promise<void>;
  findRouteByAssignmentId(assignmentId: string): Promise<DeliveryRoute | null>;
}
