export interface PickerInfo {
  readonly pickerId: string;
  readonly name: string;
  readonly available: boolean;
}

/** Picker assignment port — all picker providers implement this interface. */
export interface IPickerProvider {
  getAvailablePickers(): Promise<readonly PickerInfo[]>;
  isPickerAvailable(pickerId: string): Promise<boolean>;
  assignPicker(pickerId: string, taskId: string): Promise<void>;
  releasePicker(pickerId: string): Promise<void>;
}
