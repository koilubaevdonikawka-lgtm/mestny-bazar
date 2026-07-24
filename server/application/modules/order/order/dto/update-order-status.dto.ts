import type { OrderStatusValue } from "@server/application/modules/order/order/models";

export interface UpdateOrderStatusDto {
  readonly orderId: string;
  readonly status: OrderStatusValue;
  readonly reason?: string | null;
  readonly actor?: string | null;
  readonly courierId?: string | null;
}
