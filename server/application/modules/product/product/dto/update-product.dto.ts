import type { CreateProductMediaDto } from "@server/application/modules/product/product/dto/create-product.dto";

export interface UpdateProductDto {
  readonly productId: string;
  readonly sellerId: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly media?: readonly CreateProductMediaDto[];
  readonly attributes?: Readonly<Record<string, string>>;
}
