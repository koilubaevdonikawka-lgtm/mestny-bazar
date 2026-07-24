export const ProductPublicationStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN",
} as const;

export type ProductPublicationStatus =
  (typeof ProductPublicationStatus)[keyof typeof ProductPublicationStatus];

export interface SellerProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  imageUrl: string | null;
  stock: number;
  publicationStatus: ProductPublicationStatus;
  categoryId: string | null;
}

export interface CreateSellerProductRequest {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  currency?: string;
  unit?: string;
  imageUrl?: string;
  stock?: number;
  categoryId?: string;
}

export interface UpdateSellerProductRequest extends Partial<CreateSellerProductRequest> {
  id: string;
}
