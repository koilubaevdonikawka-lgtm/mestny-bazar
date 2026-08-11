/**
 * Courier as a real business entity (Промпт №068) — until now a courier was
 * only an auth.users row + user_roles('courier') + a bare
 * courier_status(is_available, last_seen_at) row, with no name/phone/vehicle
 * anywhere. Mirrors SellerProfileDTO's split from the "seller" Access-role.
 */
export const CourierVehicleType = {
  ON_FOOT: "ON_FOOT",
  BICYCLE: "BICYCLE",
  MOTORCYCLE: "MOTORCYCLE",
  CAR: "CAR",
  OTHER: "OTHER",
} as const;
export type CourierVehicleType = (typeof CourierVehicleType)[keyof typeof CourierVehicleType];

/**
 * Administrative status (can this person work at all) — distinct from
 * CourierStatusDTO.isAvailable (the courier's own moment-to-moment PWA
 * presence toggle, unaffected by this).
 */
export const CourierProfileStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
} as const;
export type CourierProfileStatus = (typeof CourierProfileStatus)[keyof typeof CourierProfileStatus];

export interface CourierProfileDTO {
  userId: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  phone: string;
  vehicleType: CourierVehicleType;
  plateNumber: string | null;
  serviceZoneId: string | null;
  status: CourierProfileStatus;
  hiredAt: string | null;
  adminComment: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Rebuilt /admin/couriers list-page row — profile joined with live status + workload. */
export interface CourierListItemDTO extends CourierProfileDTO {
  isAvailable: boolean;
  lastSeenAt: string | null;
  activeDeliveries: number;
}

export interface CreateCourierProfileRequest {
  userId: string;
  lastName: string;
  firstName: string;
  middleName?: string | null;
  phone: string;
  vehicleType?: CourierVehicleType;
  plateNumber?: string | null;
  serviceZoneId?: string | null;
  hiredAt?: string | null;
  adminComment?: string | null;
  photoUrl?: string | null;
}

export interface UpdateCourierProfileRequest {
  userId: string;
  lastName?: string;
  firstName?: string;
  middleName?: string | null;
  phone?: string;
  vehicleType?: CourierVehicleType;
  plateNumber?: string | null;
  serviceZoneId?: string | null;
  hiredAt?: string | null;
  adminComment?: string | null;
  photoUrl?: string | null;
}

export interface SetCourierProfileStatusRequest {
  userId: string;
  status: CourierProfileStatus;
}

export interface BulkSetCourierProfileStatusRequest {
  userIds: string[];
  status: CourierProfileStatus;
}
