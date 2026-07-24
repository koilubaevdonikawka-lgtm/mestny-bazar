/**
 * Future integration ports for Warehouse Management.
 * Not implemented — reserved for external modules and services.
 */

import type { PickerInfo } from "./picker-provider.contract";

/** Inventory BCM — stock reservation and availability checks. */
export interface IInventoryBcm {
  reserveStock(orderId: string): Promise<boolean>;
  releaseStock(orderId: string): Promise<void>;
  confirmDeduction(orderId: string): Promise<void>;
}

/** Barcode Scanner — item verification during picking. */
export interface IBarcodeScanner {
  scanItem(taskId: string, barcode: string): Promise<{ valid: boolean; productId?: string }>;
}

/** Picking Optimization — route and batch optimization for pickers. */
export interface IPickingOptimization {
  optimizePickingRoute(taskId: string): Promise<readonly string[]>;
  suggestBatchPicking(taskIds: readonly string[]): Promise<readonly string[]>;
}

/** Notification BCM — warehouse status notifications. */
export interface IWarehouseNotificationProvider {
  notifyPickingAssigned(taskId: string, pickerId: string): Promise<void>;
  notifyPickingCompleted(taskId: string, orderId: string): Promise<void>;
  notifyPickingDelayed(taskId: string, reason?: string): Promise<void>;
}

/** Analytics BCM — warehouse performance metrics. */
export interface IWarehouseAnalyticsProvider {
  trackPickingTaskCreated(taskId: string, orderId: string): Promise<void>;
  trackPickingCompleted(taskId: string, orderId: string, durationMinutes: number): Promise<void>;
  trackPickingCancelled(taskId: string, orderId: string): Promise<void>;
}

/** Robot Picking — automated picking systems. */
export interface IRobotPicking {
  dispatchRobot(taskId: string): Promise<string>;
  getRobotStatus(robotId: string): Promise<string>;
  cancelRobotTask(robotId: string): Promise<void>;
}
