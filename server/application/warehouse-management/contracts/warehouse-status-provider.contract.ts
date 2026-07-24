import type { PickingStatus } from "@server/application/warehouse-management/models/picking-task.model";

export interface IWarehouseStatusProvider {
  canTransition(from: PickingStatus, to: PickingStatus): boolean;
  getAllowedTransitions(from: PickingStatus): readonly PickingStatus[];
  isTerminal(status: PickingStatus): boolean;
}
