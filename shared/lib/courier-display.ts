import type { CourierVehicleType } from "@shared/contracts/courier-profile";

const VEHICLE_TYPE_LABELS: Record<CourierVehicleType, string> = {
  ON_FOOT: "Пешком",
  BICYCLE: "Велосипед",
  MOTORCYCLE: "Мотоцикл",
  CAR: "Автомобиль",
  OTHER: "Другое",
};

export function formatVehicleType(vehicleType: CourierVehicleType): string {
  return VEHICLE_TYPE_LABELS[vehicleType] ?? vehicleType;
}
