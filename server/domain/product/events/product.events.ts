import { DomainEvent } from "@server/domain/product/events/domain-event.base";
import type { ProductStatus } from "@server/domain/product/status/product-status";

/** Base class for product domain events. */
export abstract class ProductDomainEventBase extends DomainEvent {
  protected constructor(
    readonly productId: string,
    readonly sellerId: string,
    occurredAt: string,
  ) {
    super(occurredAt);
  }
}

export class ProductCreatedEvent extends ProductDomainEventBase {
  readonly eventName = "product.created" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      status: ProductStatus;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export class ProductUpdatedEvent extends ProductDomainEventBase {
  readonly eventName = "product.updated" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      name: string;
      description: string | null;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export class ProductPriceChangedEvent extends ProductDomainEventBase {
  readonly eventName = "product.price.changed" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousAmount: number;
      previousCurrency: string;
      nextAmount: number;
      nextCurrency: string;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export class ProductInventoryChangedEvent extends ProductDomainEventBase {
  readonly eventName = "product.inventory.changed" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousQuantity: number;
      nextQuantity: number;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export class ProductMediaChangedEvent extends ProductDomainEventBase {
  readonly eventName = "product.media.changed" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      photoCount: number;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export class ProductStatusChangedEvent extends ProductDomainEventBase {
  readonly eventName = "product.status.changed" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: ProductStatus;
      nextStatus: ProductStatus;
      reason: string;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export class ProductArchivedEvent extends ProductDomainEventBase {
  readonly eventName = "product.archived" as const;

  constructor(
    productId: string,
    sellerId: string,
    occurredAt: string,
    readonly payload: {
      previousStatus: ProductStatus;
    },
  ) {
    super(productId, sellerId, occurredAt);
  }
}

export type ProductDomainEvent =
  | ProductCreatedEvent
  | ProductUpdatedEvent
  | ProductPriceChangedEvent
  | ProductInventoryChangedEvent
  | ProductMediaChangedEvent
  | ProductStatusChangedEvent
  | ProductArchivedEvent;

export type ProductDomainEventType = ProductDomainEvent["eventName"];
