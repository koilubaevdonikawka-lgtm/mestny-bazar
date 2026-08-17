import type { CourierStatusDTO } from "@shared/contracts/courier-status";

export interface ICourierStatusRepository {
  listAvailable(): Promise<CourierStatusDTO[]>;
  listAll(): Promise<CourierStatusDTO[]>;
  get(courierId: string): Promise<CourierStatusDTO | null>;
  /** Upserts availability + bumps last_seen_at — the only write path (courier PWA, self-only). */
  setAvailability(courierId: string, isAvailable: boolean): Promise<CourierStatusDTO>;
  /** Presence heartbeat without changing availability (e.g. on queue reads). */
  touch(courierId: string): Promise<void>;
}
