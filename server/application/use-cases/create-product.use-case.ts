import type { CreateProductCommand } from "@server/application/commands";
import { DomainEventDispatcher } from "@server/application/events";
import type {
  IIdGenerator,
  IProductRepository,
  ITransactionManager,
} from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import { Product, type ProductReadModel } from "@server/domain/product";

export class CreateProductUseCase {
  constructor(
    private readonly products: IProductRepository,
    private readonly idGenerator: IIdGenerator,
    private readonly transactionManager: ITransactionManager,
    private readonly eventDispatcher: DomainEventDispatcher,
  ) {}

  async execute(command: CreateProductCommand): Promise<UseCaseResult<ProductReadModel>> {
    return this.transactionManager.execute(async () => {
      const product = Product.create({
        id: command.productId,
        sellerId: command.dto.sellerId,
        name: command.dto.name,
        description: command.dto.description,
        priceAmount: command.dto.priceAmount,
        priceCurrency: command.dto.priceCurrency,
        inventoryQuantity: command.dto.inventoryQuantity,
        media: command.dto.media?.map((item, index) => ({
          id: item.id ?? this.idGenerator.generate(),
          url: item.url,
          sortOrder: item.sortOrder ?? index,
        })),
        attributes: command.dto.attributes,
      });

      await this.products.save(product);
      await this.eventDispatcher.dispatchFrom(product, "Product");

      return useCaseResult(product.snapshot().toJSON());
    });
  }
}
