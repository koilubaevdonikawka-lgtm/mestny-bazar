import type { GetProductQuery } from "@server/application/queries";
import type { IProductRepository } from "@server/application/ports";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { ProductReadModel } from "@server/domain/product";

export class GetProductUseCase {
  constructor(private readonly products: IProductRepository) {}

  async execute(query: GetProductQuery): Promise<UseCaseResult<ProductReadModel | null>> {
    const snapshot = await this.products.findSnapshotById(query.productId);
    return useCaseResult(snapshot);
  }
}
