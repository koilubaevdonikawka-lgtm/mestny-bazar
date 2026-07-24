export interface GetMarketplaceMetricsDto {
  readonly categoryId?: string;
}

export interface RebuildProjectionDto {
  readonly projectionId?:
    | "sales"
    | "orders"
    | "customers"
    | "sellers"
    | "products"
    | "marketplace";
}
