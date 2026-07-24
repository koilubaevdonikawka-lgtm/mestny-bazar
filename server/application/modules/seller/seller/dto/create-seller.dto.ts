export interface CreateSellerDto {
  readonly displayName: string;
  readonly email: string;
  readonly phone: string;
  readonly description?: string | null;
  readonly storeName: string;
  readonly storeAddress?: string | null;
}
