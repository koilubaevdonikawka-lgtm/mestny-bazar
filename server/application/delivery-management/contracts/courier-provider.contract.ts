export interface CourierInfo {
  readonly courierId: string;
  readonly name: string;
  readonly available: boolean;
}

/** Courier assignment port — all courier providers implement this interface. */
export interface ICourierProvider {
  getAvailableCouriers(): Promise<readonly CourierInfo[]>;
  isCourierAvailable(courierId: string): Promise<boolean>;
  assignCourier(courierId: string, deliveryId: string): Promise<void>;
  releaseCourier(courierId: string): Promise<void>;
}
