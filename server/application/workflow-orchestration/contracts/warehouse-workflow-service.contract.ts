export interface WarehouseWorkflowSnapshot {
  readonly taskId: string;
  readonly orderId: string;
  readonly status: string;
}

export interface CreatePickingWorkflowResult {
  readonly taskId: string;
  readonly orderId: string;
  readonly status: string;
}

/** Warehouse coordination port for workflow orchestration. */
export interface IWarehouseWorkflowService {
  createPickingTask(orderId: string): Promise<CreatePickingWorkflowResult>;
  completePicking(taskId: string): Promise<boolean>;
  cancelPickingTask(taskId: string, reason?: string): Promise<boolean>;
  getPickingTask(taskId: string): Promise<WarehouseWorkflowSnapshot | null>;
  findTaskByOrderId(orderId: string): Promise<WarehouseWorkflowSnapshot | null>;
}
