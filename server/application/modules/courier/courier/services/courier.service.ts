import type { ICourierStore } from "@server/application/modules/courier/courier/contracts";
import type {
  AssignCourierDto,
  CompleteDeliveryDto,
  CreateCourierDto,
  UpdateCourierStatusDto,
} from "@server/application/modules/courier/courier/dto";
import {
  createCourierAssignedEvent,
  createCourierStatusChangedEvent,
  createDeliveryCompletedEvent,
  createDeliveryStartedEvent,
} from "@server/application/modules/courier/courier/events";
import {
  assertCourierStatus,
  CourierStatus,
  createCourier,
  createCourierAssignment,
  createDeliveryRoute,
  withCourierAssignmentCompleted,
  withCourierAssignmentStarted,
  withCourierStatus,
  withDeliveryRouteCompleted,
  type Courier,
  type CourierAssignment,
} from "@server/application/modules/courier/courier/models";
import type { IIdGenerator } from "@server/application/ports";

/** Courier business capability service — orchestrates couriers via ICourierStore. */
export class CourierService {
  constructor(
    private readonly store: ICourierStore,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createCourier(dto: CreateCourierDto): Promise<Courier> {
    validateCreateCourierDto(dto);

    const courier = createCourier({
      id: this.idGenerator.generate(),
      name: dto.name,
      phone: dto.phone,
    });

    await this.store.saveCourier(courier);
    return courier;
  }

  async assignCourier(dto: AssignCourierDto): Promise<CourierAssignment> {
    validateAssignCourierDto(dto);

    const courier = await this.requireCourier(dto.courierId);
    if (courier.status !== CourierStatus.Available && courier.status !== CourierStatus.Assigned) {
      throw new Error(`Courier ${courier.id} is not available for assignment.`);
    }

    const assignment = createCourierAssignment({
      id: this.idGenerator.generate(),
      courierId: dto.courierId,
      orderId: dto.orderId,
      address: dto.address,
      phone: dto.phone,
    });

    await this.store.saveAssignment(assignment);

    const updatedCourier = withCourierStatus(courier, CourierStatus.Assigned);
    await this.store.updateCourier(updatedCourier);
    createCourierStatusChangedEvent({
      courierId: updatedCourier.id,
      previousStatus: courier.status,
      newStatus: updatedCourier.status,
    });
    createCourierAssignedEvent({
      assignmentId: assignment.id,
      courierId: assignment.courierId,
      orderId: assignment.orderId,
    });

    return assignment;
  }

  async getCourier(courierId: string): Promise<Courier | null> {
    return this.store.findCourierById(courierId.trim());
  }

  async updateCourierStatus(dto: UpdateCourierStatusDto): Promise<Courier> {
    const courier = await this.requireCourier(dto.courierId);
    const nextStatus = assertCourierStatus(dto.status);

    if (courier.status === nextStatus) {
      return courier;
    }

    const updated = withCourierStatus(courier, nextStatus);
    await this.store.updateCourier(updated);
    createCourierStatusChangedEvent({
      courierId: updated.id,
      previousStatus: courier.status,
      newStatus: updated.status,
    });

    return updated;
  }

  async startDelivery(assignmentId: string): Promise<CourierAssignment> {
    const assignment = await this.requireAssignment(assignmentId);
    if (assignment.status === "completed") {
      throw new Error(`Assignment ${assignment.id} is already completed.`);
    }

    if (assignment.status === "in_transit") {
      return assignment;
    }

    const courier = await this.requireCourier(assignment.courierId);
    const route = createDeliveryRoute({
      id: this.idGenerator.generate(),
      assignmentId: assignment.id,
      orderId: assignment.orderId,
      courierId: assignment.courierId,
      destinationAddress: assignment.address,
      destinationPhone: assignment.phone,
    });

    const updatedAssignment = withCourierAssignmentStarted(assignment);
    await this.store.saveRoute(route);
    await this.store.updateAssignment(updatedAssignment);

    const updatedCourier = withCourierStatus(courier, CourierStatus.OnDelivery);
    await this.store.updateCourier(updatedCourier);
    createCourierStatusChangedEvent({
      courierId: updatedCourier.id,
      previousStatus: courier.status,
      newStatus: updatedCourier.status,
    });
    createDeliveryStartedEvent({
      assignmentId: updatedAssignment.id,
      routeId: route.id,
      courierId: updatedAssignment.courierId,
      orderId: updatedAssignment.orderId,
    });

    return updatedAssignment;
  }

  async completeDelivery(dto: CompleteDeliveryDto): Promise<CourierAssignment> {
    const assignment = await this.requireAssignment(dto.assignmentId);
    if (assignment.status === "completed") {
      return assignment;
    }

    if (assignment.status !== "in_transit") {
      throw new Error(`Assignment ${assignment.id} must be in transit before completion.`);
    }

    const route = await this.store.findRouteByAssignmentId(assignment.id);
    if (!route) {
      throw new Error(`Delivery route not found for assignment: ${assignment.id}`);
    }

    const courier = await this.requireCourier(assignment.courierId);
    const updatedAssignment = withCourierAssignmentCompleted(assignment);
    const updatedRoute = withDeliveryRouteCompleted(route);

    await this.store.updateAssignment(updatedAssignment);
    await this.store.updateRoute(updatedRoute);

    const updatedCourier = withCourierStatus(courier, CourierStatus.Available);
    await this.store.updateCourier(updatedCourier);
    createCourierStatusChangedEvent({
      courierId: updatedCourier.id,
      previousStatus: courier.status,
      newStatus: updatedCourier.status,
    });
    createDeliveryCompletedEvent({
      assignmentId: updatedAssignment.id,
      routeId: updatedRoute.id,
      courierId: updatedAssignment.courierId,
      orderId: updatedAssignment.orderId,
    });

    return updatedAssignment;
  }

  private async requireCourier(courierId: string): Promise<Courier> {
    const courier = await this.store.findCourierById(courierId.trim());
    if (!courier) {
      throw new Error(`Courier not found: ${courierId}`);
    }
    return courier;
  }

  private async requireAssignment(assignmentId: string): Promise<CourierAssignment> {
    const assignment = await this.store.findAssignmentById(assignmentId.trim());
    if (!assignment) {
      throw new Error(`Courier assignment not found: ${assignmentId}`);
    }
    return assignment;
  }
}

function validateCreateCourierDto(dto: CreateCourierDto): void {
  if (!dto.name?.trim()) {
    throw new Error("Courier name is required.");
  }
  if (!dto.phone?.trim()) {
    throw new Error("Courier phone is required.");
  }
}

function validateAssignCourierDto(dto: AssignCourierDto): void {
  if (!dto.courierId?.trim()) {
    throw new Error("Courier id is required.");
  }
  if (!dto.orderId?.trim()) {
    throw new Error("Order id is required.");
  }
  if (!dto.address?.trim()) {
    throw new Error("Delivery address is required.");
  }
  if (!dto.phone?.trim()) {
    throw new Error("Delivery phone is required.");
  }
}
