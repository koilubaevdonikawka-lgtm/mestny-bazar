import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  ProductSortOrderStatsDTO,
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
  /** Задача №230/231 — soft duplicate-sortOrder check; returns the conflicting product's id/name, if any. sortOrder is a decimal string. */
  findBySortOrder(
    sortOrder: string,
    exceptId?: string,
  ): Promise<{ id: string; name: string } | null>;
  /** Задача №231 — current-max+1 (decimal string), computed via SQL MAX() server-side. */
  getNextSortOrder(): Promise<string>;
  /** Задача №237 — reference-only aggregate (max whole number in use, distinct whole-number count) for the product form's hint. Computed via SQL FLOOR()/COUNT(DISTINCT ...) server-side. */
  getSortOrderStats(): Promise<ProductSortOrderStatsDTO>;
}
