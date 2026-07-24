/**
 * Future integration ports for Delivery Management.
 * Not implemented — reserved for external modules and services.
 */

import type { CourierInfo } from "./courier-provider.contract";

/** Courier Management — full courier lifecycle and roster. */
export interface ICourierManagement {
  registerCourier(name: string): Promise<CourierInfo>;
  deactivateCourier(courierId: string): Promise<void>;
  getCourierSchedule(courierId: string): Promise<readonly string[]>;
}

/** Route Optimization — delivery route planning. */
export interface IRouteOptimization {
  optimizeRoute(deliveryIds: readonly string[]): Promise<readonly string[]>;
  estimateArrival(deliveryId: string): Promise<string | null>;
}

/** Warehouse Management — pick/pack coordination before dispatch. */
export interface IWarehouseManagement {
  notifyReadyForPickup(deliveryId: string): Promise<void>;
  confirmHandoff(deliveryId: string, courierId: string): Promise<boolean>;
}

/** Notification BCM — delivery status notifications. */
export interface IDeliveryNotificationProvider {
  notifyCourierAssigned(deliveryId: string, customerId: string): Promise<void>;
  notifyDeliveryCompleted(deliveryId: string, customerId: string): Promise<void>;
  notifyDeliveryDelayed(deliveryId: string, customerId: string, reason?: string): Promise<void>;
}

/** Geo Tracking — real-time location tracking. */
export interface IGeoTracking {
  trackDelivery(deliveryId: string): Promise<{ latitude: number; longitude: number } | null>;
  subscribeToUpdates(deliveryId: string, callback: (location: unknown) => void): Promise<void>;
}

/** Analytics BCM — delivery performance metrics. */
export interface IDeliveryAnalyticsProvider {
  trackDeliveryCreated(deliveryId: string, orderId: string): Promise<void>;
  trackDeliveryCompleted(deliveryId: string, orderId: string, durationMinutes: number): Promise<void>;
  trackDeliveryCancelled(deliveryId: string, orderId: string): Promise<void>;
}
