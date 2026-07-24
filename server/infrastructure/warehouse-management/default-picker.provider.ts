import type {
  IPickerProvider,
  PickerInfo,
} from "@server/application/warehouse-management/contracts/picker-provider.contract";

const DEFAULT_PICKERS: readonly PickerInfo[] = Object.freeze([
  Object.freeze({ pickerId: "picker-001", name: "Alex Picker", available: true }),
  Object.freeze({ pickerId: "picker-002", name: "Sam Warehouse", available: true }),
  Object.freeze({ pickerId: "picker-003", name: "Jordan Stock", available: true }),
]);

/**
 * Default in-memory picker provider — no scanners, RFID, or external WMS.
 * Replace with external picker/WMS adapter without changing Application Layer.
 */
export class DefaultPickerProvider implements IPickerProvider {
  private readonly pickers = new Map<string, PickerInfo>(
    DEFAULT_PICKERS.map((picker) => [picker.pickerId, { ...picker }]),
  );
  private readonly assignments = new Map<string, string>();

  async getAvailablePickers(): Promise<readonly PickerInfo[]> {
    return Object.freeze(
      [...this.pickers.values()].filter((picker) => picker.available),
    );
  }

  async isPickerAvailable(pickerId: string): Promise<boolean> {
    const picker = this.pickers.get(pickerId.trim());
    return picker?.available === true;
  }

  async assignPicker(pickerId: string, taskId: string): Promise<void> {
    const picker = this.pickers.get(pickerId.trim());
    if (!picker || !picker.available) {
      throw new Error(`Picker is not available: ${pickerId}`);
    }

    this.assignments.set(pickerId.trim(), taskId.trim());
    this.pickers.set(pickerId.trim(), Object.freeze({ ...picker, available: false }));
  }

  async releasePicker(pickerId: string): Promise<void> {
    const picker = this.pickers.get(pickerId.trim());
    if (!picker) {
      return;
    }

    this.assignments.delete(pickerId.trim());
    this.pickers.set(pickerId.trim(), Object.freeze({ ...picker, available: true }));
  }
}
