import type {
  CourierInfo,
  ICourierProvider,
} from "@server/application/delivery-management/contracts/courier-provider.contract";

const DEFAULT_COURIERS: readonly CourierInfo[] = Object.freeze([
  Object.freeze({ courierId: "courier-001", name: "Alex Courier", available: true }),
  Object.freeze({ courierId: "courier-002", name: "Sam Rider", available: true }),
  Object.freeze({ courierId: "courier-003", name: "Jordan Express", available: true }),
]);

/**
 * Default in-memory courier provider — no Telegram, GPS, or external APIs.
 * Replace with Courier Management adapter without changing Application Layer.
 */
export class DefaultCourierProvider implements ICourierProvider {
  private readonly couriers = new Map<string, CourierInfo>(
    DEFAULT_COURIERS.map((courier) => [courier.courierId, { ...courier }]),
  );
  private readonly assignments = new Map<string, string>();

  async getAvailableCouriers(): Promise<readonly CourierInfo[]> {
    return Object.freeze(
      [...this.couriers.values()].filter((courier) => courier.available),
    );
  }

  async isCourierAvailable(courierId: string): Promise<boolean> {
    const courier = this.couriers.get(courierId.trim());
    return courier?.available === true;
  }

  async assignCourier(courierId: string, deliveryId: string): Promise<void> {
    const courier = this.couriers.get(courierId.trim());
    if (!courier || !courier.available) {
      throw new Error(`Courier is not available: ${courierId}`);
    }

    this.assignments.set(courierId.trim(), deliveryId.trim());
    this.couriers.set(courierId.trim(), Object.freeze({ ...courier, available: false }));
  }

  async releaseCourier(courierId: string): Promise<void> {
    const courier = this.couriers.get(courierId.trim());
    if (!courier) {
      return;
    }

    this.assignments.delete(courierId.trim());
    this.couriers.set(courierId.trim(), Object.freeze({ ...courier, available: true }));
  }
}
