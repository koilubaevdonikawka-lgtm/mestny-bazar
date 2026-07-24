import type {
  CreateSellerProductRequest,
  ProductPublicationStatus,
  SellerProductDTO,
  UpdateSellerProductRequest,
} from "@shared/contracts/seller-product";

export interface ISellerProductRepository {
  listBySeller(sellerId: string): Promise<SellerProductDTO[]>;
  getById(id: string, sellerId: string): Promise<SellerProductDTO | null>;
  create(sellerId: string, data: CreateSellerProductRequest): Promise<SellerProductDTO>;
  update(sellerId: string, data: UpdateSellerProductRequest): Promise<SellerProductDTO>;
  setPublicationStatus(
    sellerId: string,
    id: string,
    status: ProductPublicationStatus,
  ): Promise<SellerProductDTO>;
  slugExists(slug: string, exceptId?: string): Promise<boolean>;
}
