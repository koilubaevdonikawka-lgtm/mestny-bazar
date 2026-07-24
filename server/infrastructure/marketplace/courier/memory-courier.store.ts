import type { ICourierStore } from "@server/application/modules/courier/courier/contracts";
import type {
  Courier,
  CourierAssignment,
  DeliveryRoute,
} from "@server/application/modules/courier/courier/models";
import { InMemoryStore } from "@server/infrastructure/shared";

/** In-memory courier store for development and tests. */
export class MemoryCourierStore implements ICourierStore {
  private readonly couriers = new InMemoryStore<Courier>((courier) => courier.id);
  private readonly assignments = new InMemoryStore<CourierAssignment>((assignment) => assignment.id);
  private readonly routes = new InMemoryStore<DeliveryRoute>((route) => route.id);
  private readonly routesByAssignment = new Map<string, string>();
  private readonly assignmentsByOrder = new Map<string, Set<string>>();

  async saveCourier(courier: Courier): Promise<void> {
    this.couriers.set(courier);
  }

  async updateCourier(courier: Courier): Promise<void> {
    if (!this.couriers.has(courier.id)) {
      throw new Error(`Courier not found: ${courier.id}`);
    }
    this.couriers.set(courier);
  }

  async findCourierById(courierId: string): Promise<Courier | null> {
    return this.couriers.get(courierId) ?? null;
  }

  async saveAssignment(assignment: CourierAssignment): Promise<void> {
    this.assignments.set(assignment);
    const bucket = this.assignmentsByOrder.get(assignment.orderId) ?? new Set<string>();
    bucket.add(assignment.id);
    this.assignmentsByOrder.set(assignment.orderId, bucket);
  }

  async updateAssignment(assignment: CourierAssignment): Promise<void> {
    if (!this.assignments.has(assignment.id)) {
      throw new Error(`Courier assignment not found: ${assignment.id}`);
    }
    this.assignments.set(assignment);
  }

  async findAssignmentById(assignmentId: string): Promise<CourierAssignment | null> {
    return this.assignments.get(assignmentId) ?? null;
  }

  async findAssignmentsByOrderId(orderId: string): Promise<readonly CourierAssignment[]> {
    const ids = this.assignmentsByOrder.get(orderId);
    if (!ids) {
      return Object.freeze([]);
    }

    return Object.freeze(
      [...ids]
        .map((assignmentId) => this.assignments.get(assignmentId))
        .filter((assignment): assignment is CourierAssignment => assignment !== undefined)
        .sort((left, right) => right.assignedAt.localeCompare(left.assignedAt)),
    );
  }

  async saveRoute(route: DeliveryRoute): Promise<void> {
    this.routes.set(route);
    this.routesByAssignment.set(route.assignmentId, route.id);
  }

  async updateRoute(route: DeliveryRoute): Promise<void> {
    if (!this.routes.has(route.id)) {
      throw new Error(`Delivery route not found: ${route.id}`);
    }
    this.routes.set(route);
  }

  async findRouteByAssignmentId(assignmentId: string): Promise<DeliveryRoute | null> {
    const routeId = this.routesByAssignment.get(assignmentId);
    return routeId ? (this.routes.get(routeId) ?? null) : null;
  }
}
