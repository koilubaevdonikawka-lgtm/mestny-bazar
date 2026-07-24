import type { Product } from "@server/application/modules/product/product/models";
import type { CreateProductMediaDto } from "@server/application/modules/product/product/dto";
import type {
  ChangeProductInventoryInput,
  ChangeProductPriceInput,
  CreateSellerProductInput,
  Moderator  ModeratorRejectProductInput,
  SellerProductActionInput,
  SellerProductManagementService,
  UpdateSellerProductInput,
  UploadProductImagesInput,
} from "@server/application/seller-product/services/seller-product-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class CreateProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: CreateSellerProductInput): Promise<UseCaseResult<Product>> {
    return this.management.createProduct(input).then(useCaseResult);
  }
}

export class UpdateProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: UpdateSellerProductInput): Promise<UseCaseResult<Product>> {
    return this.management.updateProduct(input).then(useCaseResult);
  }
}

export class DeleteProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  async execute(input: SellerProductActionInput): Promise<UseCaseResult<{ deleted: true }>> {
    await this.management.deleteProduct(input);
    return useCaseResult({ deleted: true as const });
  }
}

export class UploadProductImagesUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: UploadProductImagesInput): Promise<UseCaseResult<Product>> {
    return this.management.uploadImages(input).then(useCaseResult);
  }
}

export class ChangePriceUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: ChangeProductPriceInput): Promise<UseCaseResult<Product>> {
    return this.management.changePrice(input).then(useCaseResult);
  }
}

export class ChangeInventoryUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: ChangeProductInventoryInput): Promise<UseCaseResult<Product>> {
    return this.management.changeInventory(input).then(useCaseResult);
  }
}

export class SubmitForModerationUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: SellerProductActionInput): Promise<UseCaseResult<Product>> {
    return this.management.submitForModeration(input).then(useCaseResult);
  }
}

export class ApproveProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(productId: string): Promise<UseCaseResult<Product>> {
    return this.management.approveProduct(productId).then(useCaseResult);
  }
}

export class RejectProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: ModeratorRejectProductInput): Promise<UseCaseResult<Product>> {
    return this.management.rejectProduct(input.productId, input.reason).then(useCaseResult);
  }
}

export class PublishProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: SellerProductActionInput): Promise<UseCaseResult<Product>> {
    return this.management.publishProduct(input).then(useCaseResult);
  }
}

export class UnpublishProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: SellerProductActionInput): Promise<UseCaseResult<Product>> {
    return this.management.unpublishProduct(input).then(useCaseResult);
  }
}

export class ArchiveProductUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(input: SellerProductActionInput): Promise<UseCaseResult<Product>> {
    return this.management.archiveProduct(input).then(useCaseResult);
  }
}

export class GetSellerProductsUseCase {
  constructor(private readonly management: SellerProductManagementService) {}

  execute(sellerId: string): Promise<UseCaseResult<readonly Product[]>> {
    return this.management.getSellerProducts(sellerId).then(useCaseResult);
  }
}

export type { CreateProductMediaDto };
