import type { CreateProductDto } from "@server/application/dto";
import { CreateProductCommand } from "@server/application/commands";
import { GetProductQuery } from "@server/application/queries";
import type { IIdGenerator } from "@server/application/ports";
import {
  CreateProductUseCase,
  GetProductUseCase,
} from "@server/application/use-cases";
import type { ProductReadModel } from "@server/domain/product";

/** Product application facade — orchestrates use cases without domain logic. */
export class ProductApplicationService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<ProductReadModel> {
    const productId = this.idGenerator.generate();
    const command = CreateProductCommand.create(productId, dto);
    const result = await this.createProductUseCase.execute(command);
    return result.value;
  }

  async getProduct(productId: string): Promise<ProductReadModel | null> {
    const query = GetProductQuery.create(productId);
    const result = await this.getProductUseCase.execute(query);
    return result.value;
  }
}
