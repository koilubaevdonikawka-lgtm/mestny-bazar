export interface CourierStatusDTO {
  courierId: string;
  isAvailable: boolean;
  lastSeenAt: string;
}

export interface SetCourierAvailabilityRequest {
  isAvailable: boolean;
}

/** Admin overview row — courier-status.md §"Активные назначения" widget. */
export interface CourierAdminSummaryDTO {
  courierId: string;
  isAvailable: boolean;
  lastSeenAt: string;
  activeDeliveries: number;
}
