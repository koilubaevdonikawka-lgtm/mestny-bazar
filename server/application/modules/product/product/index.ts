export { ProductModule } from "./api";
export type { IProductStore, IInventoryProvider } from "./contracts";
export type {
  CreateProductDto,
  CreateProductMediaDto,
  UpdateProductDto,
  UpdateProductPriceDto,
  UpdateProductStockDto,
  PublishProductDto,
} from "./dto";
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
} from "./events";
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
} from "./models";
export { ProductService, ProductPolicy } from "./services";
