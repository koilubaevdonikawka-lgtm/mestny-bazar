import type {
  AssignCourierDto,
  CompleteDeliveryDto,
  CreateCourierDto,
  UpdateCourierStatusDto,
} from "@server/application/modules/courier/courier/dto";
import type { Courier, CourierAssignment } from "@server/application/modules/courier/courier/models";
import type { CourierService } from "@server/application/modules/courier/courier/services";

/** Public entry point for the Courier business capability module. */
export class CourierModule {
  constructor(private readonly service: CourierService) {}

  createCourier(dto: CreateCourierDto): Promise<Courier> {
    return this.service.createCourier(dto);
  }

  assignCourier(dto: AssignCourierDto): Promise<CourierAssignment> {
    return this.service.assignCourier(dto);
  }

  getCourier(courierId: string): Promise<Courier | null> {
    return this.service.getCourier(courierId);
  }

  updateCourierStatus(dto: UpdateCourierStatusDto): Promise<Courier> {
    return this.service.updateCourierStatus(dto);
  }

  startDelivery(assignmentId: string): Promise<CourierAssignment> {
    return this.service.startDelivery(assignmentId);
  }

  completeDelivery(dto: CompleteDeliveryDto): Promise<CourierAssignment> {
    return this.service.completeDelivery(dto);
  }
}
