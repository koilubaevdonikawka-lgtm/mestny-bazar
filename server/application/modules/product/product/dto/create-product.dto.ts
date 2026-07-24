export interface CreateProductMediaDto {
  readonly id?: string;
  readonly url: string;
  readonly sortOrder?: number;
}

export interface CreateProductDto {
  readonly sellerId: string;
  readonly name: string;
  readonly description?: string | null;
  readonly priceAmount: number;
  readonly priceCurrency: string;
  readonly stockQuantity: number;
  readonly media?: readonly CreateProductMediaDto[];
  readonly attributes?: Readonly<Record<string, string>>;
}
