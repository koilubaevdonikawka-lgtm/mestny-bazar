import {
  InvalidSellerIdError,
  ProductPolicyViolationError,
} from "@server/domain/product/exceptions/product.errors";
import {
  ProductArchivedEvent,
  ProductCreatedEvent,
  ProductInventoryChangedEvent,
  ProductMediaChangedEvent,
  ProductPriceChangedEvent,
  ProductStatusChangedEvent,
  ProductUpdatedEvent,
  type ProductDomainEvent,
} from "@server/domain/product/events/product.events";
import { ProductLifecycle } from "@server/domain/product/lifecycle/product-lifecycle";
import { ProductPolicy, type ProductPolicySnapshot } from "@server/domain/product/policies/product.policy";
import { ProductSnapshot, type ProductReadModel } from "@server/domain/product/snapshot/product-snapshot";
import { ProductStatus } from "@server/domain/product/status/product-status";
import {
  ProductAttributes,
  ProductDescription,
  ProductId,
  ProductInventory,
  ProductMedia,
  type ProductMediaItem,
  ProductName,
  ProductPrice,
} from "@server/domain/product/value-objects";

export interface CreateProductProps {
  id: string;
  sellerId: string;
  name: string;
  description?: string | null;
  priceAmount: number;
  priceCurrency: string;
  inventoryQuantity: number;
  media?: ProductMediaItem[];
  attributes?: Record<string, string>;
}

export interface ReconstituteProductProps {
  id: string;
  sellerId: string;
  name: string;
  description: string | null;
  priceAmount: number;
  priceCurrency: string;
  inventoryQuantity: number;
  media: ProductMediaItem[];
  attributes: Record<string, string>;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type { ProductReadModel };

/** Product aggregate root — sole entry point for product state mutations. */
export class Product {
  private readonly domainEvents: ProductDomainEvent[] = [];
  private readonly policy = new ProductPolicy();

  private constructor(
    private readonly id: ProductId,
    private readonly sellerId: string,
    private name: ProductName,
    private description: ProductDescription,
    private price: ProductPrice,
    private inventory: ProductInventory,
    private media: ProductMedia,
    private attributes: ProductAttributes,
    private status: ProductStatus,
    private readonly createdAt: string,
    private updatedAt: string,
  ) {}

  static create(props: CreateProductProps): Product {
    const sellerId = props.sellerId?.trim();
    if (!sellerId) {
      throw new InvalidSellerIdError();
    }

    const now = new Date().toISOString();
    const product = new Product(
      ProductId.create(props.id),
      sellerId,
      ProductName.create(props.name),
      ProductDescription.create(props.description),
      ProductPrice.create(props.priceAmount, props.priceCurrency),
      ProductInventory.create(props.inventoryQuantity),
      props.media ? ProductMedia.create(props.media) : ProductMedia.empty(),
      props.attributes ? ProductAttributes.create(props.attributes) : ProductAttributes.empty(),
      ProductStatus.Draft,
      now,
      now,
    );

    product.record(
      new ProductCreatedEvent(product.id.toString(), product.sellerId, now, {
        name: product.name.toString(),
        status: product.status,
      }),
    );

    return product;
  }

  static reconstitute(props: ReconstituteProductProps): Product {
    const sellerId = props.sellerId?.trim();
    if (!sellerId) {
      throw new InvalidSellerIdError();
    }

    return new Product(
      ProductId.create(props.id),
      sellerId,
      ProductName.create(props.name),
      ProductDescription.create(props.description),
      ProductPrice.create(props.priceAmount, props.priceCurrency),
      ProductInventory.create(props.inventoryQuantity),
      ProductMedia.create(props.media),
      ProductAttributes.create(props.attributes),
      props.status,
      props.createdAt,
      props.updatedAt,
    );
  }

  updateDetails(name: string, description?: string | null): void {
    this.assertCanEdit("update_details");

    this.name = ProductName.create(name);
    if (description !== undefined) {
      this.description = ProductDescription.create(description);
    }
    this.touch();

    this.record(
      new ProductUpdatedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        name: this.name.toString(),
        description: this.description.toString(),
      }),
    );
  }

  changePrice(amount: number, currency: string): void {
    this.assertPolicy(this.policy.canChangePrice.bind(this.policy), "change_price");

    const previous = this.price;
    const next = ProductPrice.create(amount, currency);
    if (previous.equals(next)) {
      return;
    }

    this.price = next;
    this.touch();

    this.record(
      new ProductPriceChangedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        previousAmount: previous.amountValue(),
        previousCurrency: previous.currencyCode(),
        nextAmount: next.amountValue(),
        nextCurrency: next.currencyCode(),
      }),
    );
  }

  changeInventory(quantity: number): void {
    this.assertPolicy(this.policy.canChangeInventory.bind(this.policy), "change_inventory");

    const previous = this.inventory;
    const next = ProductInventory.create(quantity);
    if (previous.equals(next)) {
      return;
    }

    this.inventory = next;
    this.touch();

    this.record(
      new ProductInventoryChangedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        previousQuantity: previous.quantityValue(),
        nextQuantity: next.quantityValue(),
      }),
    );
  }

  updateMedia(items: ProductMediaItem[]): void {
    this.assertPolicy(this.policy.canChangeMedia.bind(this.policy), "change_media");

    const next = ProductMedia.create(items);
    if (this.media.equals(next)) {
      return;
    }

    this.media = next;
    this.touch();

    this.record(
      new ProductMediaChangedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        photoCount: next.count(),
      }),
    );
  }

  updateAttributes(values: Record<string, string>): void {
    this.assertPolicy(this.policy.canChangeAttributes.bind(this.policy), "change_attributes");

    const next = ProductAttributes.create(values);
    if (this.attributes.equals(next)) {
      return;
    }

    this.attributes = next;
    this.touch();

    this.record(
      new ProductUpdatedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        name: this.name.toString(),
        description: this.description.toString(),
      }),
    );
  }

  submitForReview(): void {
    this.transitionStatus("submit_for_review", "Submitted for review");
  }

  approveForPublication(): void {
    this.transitionStatus("approve_for_publication", "Approved for publication");
  }

  rejectReview(): void {
    this.transitionStatus("reject_review", "Review rejected");
  }

  publish(): void {
    this.assertPolicy(this.policy.canPublish.bind(this.policy), "publish");
    this.transitionStatus("publish", "Published to catalog");
  }

  hide(): void {
    this.assertPolicy(this.policy.canHide.bind(this.policy), "hide");
    this.transitionStatus("hide", "Hidden from catalog");
  }

  unhide(): void {
    this.transitionStatus("unhide", "Restored to catalog");
  }

  archive(): void {
    this.assertPolicy(this.policy.canArchive.bind(this.policy), "archive");

    const previousStatus = this.status;
    this.transitionStatus("archive", "Archived");
    this.record(
      new ProductArchivedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        previousStatus,
      }),
    );
  }

  pullDomainEvents(): ProductDomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  peekDomainEvents(): readonly ProductDomainEvent[] {
    return [...this.domainEvents];
  }

  snapshot(): ProductSnapshot {
    return ProductSnapshot.capture({
      id: this.id,
      sellerId: this.sellerId,
      name: this.name,
      description: this.description,
      price: this.price,
      inventory: this.inventory,
      media: this.media,
      attributes: this.attributes,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  private transitionStatus(
    action: Parameters<typeof ProductLifecycle.transition>[1],
    reason: string,
  ): void {
    const previousStatus = this.status;
    const nextStatus = ProductLifecycle.transition(previousStatus, action);
    if (previousStatus === nextStatus) {
      return;
    }

    this.status = nextStatus;
    this.touch();

    this.record(
      new ProductStatusChangedEvent(this.id.toString(), this.sellerId, this.updatedAt, {
        previousStatus,
        nextStatus,
        reason,
      }),
    );
  }

  private policySnapshot(): ProductPolicySnapshot {
    return {
      status: this.status,
      price: this.price,
      inventory: this.inventory,
      media: this.media,
      attributes: this.attributes,
    };
  }

  private assertCanEdit(action: string): void {
    this.assertPolicy(this.policy.canEdit.bind(this.policy), action);
  }

  private assertPolicy(
    predicate: (snapshot: ProductPolicySnapshot) => boolean,
    action: string,
  ): void {
    if (!predicate(this.policySnapshot())) {
      throw new ProductPolicyViolationError(
        `Action "${action}" is not permitted for product in status "${this.status}"`,
        action,
      );
    }
  }

  private touch(): void {
    this.updatedAt = new Date().toISOString();
  }

  private record(event: ProductDomainEvent): void {
    this.domainEvents.push(Object.freeze(event));
  }
}
