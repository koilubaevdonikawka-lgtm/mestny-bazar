import type { BannerDTO, CreateBannerRequest, UpdateBannerRequest } from "@shared/contracts/banner";

export interface IBannerRepository {
  /** Admin-facing — all banners, active and inactive. */
  listAll(): Promise<BannerDTO[]>;
  /** Storefront-facing — active banners only; date-range filtering is applied by BannerService. */
  listActive(): Promise<BannerDTO[]>;
  create(data: CreateBannerRequest): Promise<BannerDTO>;
  update(data: UpdateBannerRequest): Promise<BannerDTO>;
}
