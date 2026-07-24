export interface UpdateMarketplaceConfigurationDto {
  readonly actorId: string;
  readonly maxListingCount?: number;
  readonly autoApproveSellers?: boolean;
  readonly commissionRate?: number;
}
