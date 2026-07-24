import type { OrderReadModel, ReconstituteOrderProps } from "@server/domain/order";
import { Order } from "@server/domain/order";

export function orderReadModelToReconstituteProps(model: OrderReadModel): ReconstituteOrderProps {
  return {
    id: model.id,
    orderNumber: model.orderNumber,
    customerId: model.customerId,
    status: model.status,
    items: model.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      sellerId: item.sellerId,
      catalogId: item.catalogId,
      name: item.name,
      priceAmount: item.price.amount,
      currency: item.price.currency,
      quantity: item.quantity,
    })),
    address: model.address,
    phone: model.phone,
    comment: model.comment,
    paymentMethod: model.paymentMethod,
    deliveryMethod: model.deliveryMethod,
    totals: {
      subtotal: { ...model.totals.subtotal },
      deliveryFee: { ...model.totals.deliveryFee },
      discount: { ...model.totals.discount },
      total: { ...model.totals.total },
    },
    courierId: model.courierId,
    cancellationReason: model.cancellationReason,
    refundReason: model.refundReason,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function reconstituteOrder(model: OrderReadModel): Order {
  return Order.reconstitute(orderReadModelToReconstituteProps(model));
}
