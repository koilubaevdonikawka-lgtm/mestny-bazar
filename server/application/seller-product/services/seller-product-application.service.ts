import type {
  ChangeProductInventoryInput,
  ChangeProductPriceInput,
  CreateSellerProductInput,
  ModeratorRejectProductInput,
  SellerProductActionInput,
  UpdateSellerProductInput,
  UploadProductImagesInput,
} from "@server/application/seller-product/services/seller-product-management.service";
import {
  ApproveProductUseCase,
  ArchiveProductUseCase,
  ChangeInventoryUseCase,
  ChangePriceUseCase,
  CreateProductUseCase,
  DeleteProductUseCase,
  GetSellerProductsUseCase,
  PublishProductUseCase,
  RejectProductUseCase,
  SubmitForModerationUseCase,
  UnpublishProductUseCase,
  UpdateProductUseCase,
  UploadProductImagesUseCase,
} from "@server/application/seller-product/use-cases/seller-product.use-cases";

/** Application facade for seller product management scenario. */
export class SellerProductApplicationService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly uploadProductImagesUseCase: UploadProductImagesUseCase,
    private readonly changePriceUseCase: ChangePriceUseCase,
    private readonly changeInventoryUseCase: ChangeInventoryUseCase,
    private readonly submitForModerationUseCase: SubmitForModerationUseCase,
    private readonly approveProductUseCase: ApproveProductUseCase,
    private readonly rejectProductUseCase: RejectProductUseCase,
    private readonly publishProductUseCase: PublishProductUseCase,
    private readonly unpublishProductUseCase: UnpublishProductUseCase,
    private readonly archiveProductUseCase: ArchiveProductUseCase,
    private readonly getSellerProductsUseCase: GetSellerProductsUseCase,
  ) {}

  createProduct(input: CreateSellerProductInput) {
    return this.createProductUseCase.execute(input);
  }

  updateProduct(input: UpdateSellerProductInput) {
    return this.updateProductUseCase.execute(input);
  }

  deleteProduct(input: SellerProductActionInput) {
    return this.deleteProductUseCase.execute(input);
  }

  uploadImages(input: UploadProductImagesInput) {
    return this.uploadProductImagesUseCase.execute(input);
  }

  changePrice(input: ChangeProductPriceInput) {
    return this.changePriceUseCase.execute(input);
  }

  changeInventory(input: ChangeProductInventoryInput) {
    return this.changeInventoryUseCase.execute(input);
  }

  submitForModeration(input: SellerProductActionInput) {
    return this.submitForModerationUseCase.execute(input);
  }

  approveProduct(productId: string) {
    return this.approveProductUseCase.execute(productId);
  }

  rejectProduct(input: ModeratorRejectProductInput) {
    return this.rejectProductUseCase.execute(input);
  }

  publishProduct(input: SellerProductActionInput) {
    return this.publishProductUseCase.execute(input);
  }

  unpublishProduct(input: SellerProductActionInput) {
    return this.unpublishProductUseCase.execute(input);
  }

  archiveProduct(input: SellerProductActionInput) {
    return this.archiveProductUseCase.execute(input);
  }

  getSellerProducts(sellerId: string) {
    return this.getSellerProductsUseCase.execute(sellerId);
  }
}
