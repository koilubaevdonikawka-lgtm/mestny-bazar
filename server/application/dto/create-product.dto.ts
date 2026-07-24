export interface CreateProductMediaDto {
  id?: string;
  url: string;
  sortOrder?: number;
}

export interface CreateProductDto {
  sellerId: string;
  name: string;
  description?: string | null;
  priceAmount: number;
  priceCurrency: string;
  inventoryQuantity: number;
  media?: CreateProductMediaDto[];
  attributes?: Record<string, string>;
}
