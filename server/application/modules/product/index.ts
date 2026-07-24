export { ProductModule } from "./product";
export type { IProductStore, IInventoryProvider } from "./product/contracts";
export type {
  CreateProductDto,
  CreateProductMediaDto,
  UpdateProductDto,
  UpdateProductPriceDto,
  UpdateProductStockDto,
  PublishProductDto,
} from "./product/dto";
export {
  type ProductCreatedEvent,
  type ProductUpdatedEvent,
  type ProductPublishedEvent,
  type ProductPriceChangedEvent,
  type ProductStockChangedEvent,
  createProductCreatedEvent,
  createProductUpdatedEvent,
  createProductPublishedEvent,
  createProductPriceChangedEvent,
  createProductStockChangedEvent,
} from "./product/events";
export {
  ProductStatus,
  PRODUCT_STATUS_VALUES,
  isProductStatus,
  assertProductStatus,
  isPubliclyVisibleProductStatus,
  type Product,
  type ProductPrice,
  type ProductStock,
  type ProductMediaItem,
  type ProductStatusValue,
  createProduct,
  createProductPrice,
  createProductStock,
  updateProductDetails,
  withProductPrice,
  withProductStock,
  withProductStatus,
} from "./product/models";
export { ProductService, ProductPolicy } from "./product/services";
