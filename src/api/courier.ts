import type { OrderDTO } from "@shared/contracts/order";
import type { CourierStatusDTO } from "@shared/contracts/courier-status";
import {
  acceptCourierOrderFn,
  completeCourierDeliveryFn,
  getCourierOrderFn,
  listCourierOrdersFn,
  markCourierArrivalFn,
  setCourierAvailabilityFn,
  startCourierDeliveryFn,
} from "@/api/courier.functions";

export async function listCourierOrders(): Promise<OrderDTO[]> {
  return listCourierOrdersFn();
}

export async function getCourierOrder(id: string): Promise<OrderDTO> {
  return getCourierOrderFn({ data: { id } });
}

export async function acceptCourierOrder(id: string): Promise<OrderDTO> {
  return acceptCourierOrderFn({ data: { id } });
}

export async function startCourierDelivery(id: string): Promise<OrderDTO> {
  return startCourierDeliveryFn({ data: { id } });
}

export async function markCourierArrival(id: string): Promise<OrderDTO> {
  return markCourierArrivalFn({ data: { id } });
}

export async function completeCourierDelivery(id: string): Promise<OrderDTO> {
  return completeCourierDeliveryFn({ data: { id } });
}

export async function setCourierAvailability(isAvailable: boolean): Promise<CourierStatusDTO> {
  return setCourierAvailabilityFn({ data: { isAvailable } });
}
