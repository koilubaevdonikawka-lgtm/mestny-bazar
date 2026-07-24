import type { IWarehouseStatusProvider } from "@server/application/warehouse-management/contracts/warehouse-status-provider.contract";
import { PickingStatus } from "@server/application/warehouse-management/models/picking-task.model";

const TRANSITIONS: Readonly<Record<PickingStatus, readonly PickingStatus[]>> = Object.freeze({
  [PickingStatus.Pending]: Object.freeze([
    PickingStatus.Assigned,
    PickingStatus.Cancelled,
  ]),
  [PickingStatus.Assigned]: Object.freeze([
    PickingStatus.InProgress,
    PickingStatus.Cancelled,
  ]),
  [PickingStatus.InProgress]: Object.freeze([
    PickingStatus.Completed,
    PickingStatus.Cancelled,
  ]),
  [PickingStatus.Completed]: Object.freeze([]),
  [PickingStatus.Cancelled]: Object.freeze([]),
});

/** Default picking status transition rules. */
export class DefaultWarehouseStatusProvider implements IWarehouseStatusProvider {
  canTransition(from: PickingStatus, to: PickingStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  getAllowedTransitions(from: PickingStatus): readonly PickingStatus[] {
    return TRANSITIONS[from];
  }

  isTerminal(status: PickingStatus): boolean {
    return status === PickingStatus.Completed || status === PickingStatus.Cancelled;
  }
}
