import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  SellerProductDTO,
  SellerProductListParams,
  SellerProductListResult,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";

export interface ISellerProductRepository {
  listBySeller(sellerId: string): Promise<SellerProductDTO[]>;
  /** Admin-wide, paginated, cross-seller view (Промпт №103 — unified product lifecycle). */
  listAll(params: SellerProductListParams): Promise<SellerProductListResult>;
  /** sellerId: null means no ownership scoping — admin access to any product. */
  getById(id: string, sellerId: string | null): Promise<SellerProductDTO | null>;
  create(sellerId: string | null, data: CreateSellerProductRequest): Promise<SellerProductDTO>;
  update(sellerId: string | null, data: UpdateSellerProductRequest): Promise<SellerProductDTO>;
  setPublicationStatus(
    sellerId: string | null,
    id: string,
    status: ProductPublicationStatus,
  ): Promise<SellerProductDTO>;
  /** sellerId: null means no ownership scoping — admin may delete any product. */
  delete(id: string, sellerId: string | null): Promise<void>;
  slugExists(slug: string, exceptId?: string): Promise<boolean>;
}
