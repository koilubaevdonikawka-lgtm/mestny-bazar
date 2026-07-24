import type {
  AssignWarehouseWorkerDto,
  CompleteWarehouseTaskDto,
  CreateWarehouseTaskDto,
} from "@server/application/modules/warehouse/warehouse/dto";
import type { WarehouseTask } from "@server/application/modules/warehouse/warehouse/models";
import type { WarehouseService } from "@server/application/modules/warehouse/warehouse/services";

/** Public entry point for the Warehouse business capability module. */
export class WarehouseModule {
  constructor(private readonly service: WarehouseService) {}

  createTask(dto: CreateWarehouseTaskDto): Promise<WarehouseTask> {
    return this.service.createTask(dto);
  }

  assignWorker(dto: AssignWarehouseWorkerDto): Promise<WarehouseTask> {
    return this.service.assignWorker(dto);
  }

  getTask(taskId: string): Promise<WarehouseTask | null> {
    return this.service.getTask(taskId);
  }

  completeTask(dto: CompleteWarehouseTaskDto): Promise<WarehouseTask> {
    return this.service.completeTask(dto);
  }

  getTasksByOrder(orderId: string): Promise<readonly WarehouseTask[]> {
    return this.service.getTasksByOrder(orderId);
  }
}
