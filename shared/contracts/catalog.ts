export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  unit: string | null;
  imageUrl: string | null;
  stock: number;
  inStock: boolean;
  categoryId: string | null;
  category?: Pick<CategoryDTO, "id" | "name" | "slug">;
}

export interface ProductListParams {
  categorySlug?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  inStockOnly?: boolean;
}

export interface ProductListResult {
  items: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
