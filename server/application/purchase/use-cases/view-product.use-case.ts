import type { ProductModule } from "@server/application/modules/product/product/api/product.module";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";
import type { ViewProductResult } from "@server/application/purchase/dto";

/** View a single product via Product BCM. */
export class ViewProductUseCase {
  constructor(private readonly products: ProductModule) {}

  async execute(productId: string): Promise<UseCaseResult<ViewProductResult>> {
    const product = await this.products.getProduct(productId.trim());
    return useCaseResult(product);
  }
}
