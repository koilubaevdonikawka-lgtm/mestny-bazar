/**
 * Admin-facing category shape — distinct from CategoryDTO (catalog.ts), which
 * is the customer-facing read model (active categories only, no isActive
 * field). Admins need to see and toggle inactive categories too; mirrors the
 * SellerProductDTO/ProductDTO split already used for products.
 */
export interface AdminCategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}
