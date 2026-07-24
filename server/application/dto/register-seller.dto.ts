export interface RegisterSellerDto {
  name: string;
  phone: string;
  email: string;
  address: string;
  limits?: {
    maxProducts?: number;
    maxPublishedProducts?: number;
    maxImagesPerProduct?: number;
    maxCategories?: number;
    extensions?: Record<string, number>;
  };
}
