import type { ProductService } from "@server/application/modules/product/product/services";
import type {
  CreateProductDto,
  PublishProductDto,
  UpdateProductDto,
} from "@server/application/modules/product/product/dto";
import type { Product, ProductPrice } from "@server/application/modules/product/product/models";
import { ProductStatus } from "@server/application/modules/product/product/models";
import { AnalyticsCapabilityEventName } from "@server/application/modules/analytics/analytics/services/analytics-capability-event-names";
import type { CapabilityEventPublisher } from "@server/infrastructure/analytics/capability-event-publisher";

/** Publishes product capability events without modifying ProductService business logic. */
export class EventPublishingProductService
  implements
    Pick<
      ProductService,
      | "createProduct"
      | "updateProduct"
      | "prepareForPublication"
      | "getProduct"
      | "exists"
      | "getCurrentPrice"
      | "getAvailableStock"
    >
{
  constructor(
    private readonly inner: ProductService,
    private readonly publisher: CapabilityEventPublisher,
  ) {}

  createProduct(dto: CreateProductDto): Promise<Product> {
    return this.inner.createProduct(dto).then(async (product) => {
      await this.publisher.publish({
        eventName: AnalyticsCapabilityEventName.ProductCreated,
        aggregateId: product.id,
        aggregateType: "Product",
        payload: {
          productId: product.id,
          sellerId: product.sellerId,
          status: product.status,
        },
      });
      return product;
    });
  }

  updateProduct(dto: UpdateProductDto): Promise<Product> {
    return this.inner.updateProduct(dto);
  }

  prepareForPublication(dto: PublishProductDto): Promise<Product> {
    return this.inner.prepareForPublication(dto).then(async (product) => {
      if (product.status === ProductStatus.ReadyForPublication) {
        await this.publisher.publish({
          eventName: AnalyticsCapabilityEventName.ProductReadyForPublication,
          aggregateId: product.id,
          aggregateType: "Product",
          payload: {
            productId: product.id,
            sellerId: product.sellerId,
            status: product.status,
          },
        });
      }
      return product;
    });
  }

  getProduct(productId: string): Promise<Product | null> {
    return this.inner.getProduct(productId);
  }

  exists(productId: string): Promise<boolean> {
    return this.inner.exists(productId);
  }

  getCurrentPrice(productId: string): Promise<ProductPrice | null> {
    return this.inner.getCurrentPrice(productId);
  }

  getAvailableStock(productId: string): Promise<number | null> {
    return this.inner.getAvailableStock(productId);
  }
}

export function asProductService(wrapper: EventPublishingProductService): ProductService {
  return wrapper as unknown as ProductService;
}
