import type { IBannerRepository } from "@server/ports/banner.repository";
import type { BannerDTO, CreateBannerRequest, UpdateBannerRequest } from "@shared/contracts/banner";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import { BannerValidationError } from "@server/domain/banner.errors";

/**
 * design.md — home page banners. A wholly new, additive concept (a new Hero
 * section on the storefront), distinct from the category image_url hardcode
 * fix (which reuses CategoryAdminService, not this service).
 */
export class BannerService {
  constructor(
    private readonly banners: IBannerRepository,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listAllBanners(): Promise<BannerDTO[]> {
    return this.banners.listAll();
  }

  /** Storefront-facing: active AND within its display period (if one is set). */
  async listActiveBanners(): Promise<BannerDTO[]> {
    const active = await this.banners.listActive();
    const now = Date.now();
    return active.filter((banner) => {
      if (banner.startsAt && new Date(banner.startsAt).getTime() > now) return false;
      if (banner.endsAt && new Date(banner.endsAt).getTime() < now) return false;
      return true;
    });
  }

  async createBanner(data: CreateBannerRequest): Promise<BannerDTO> {
    this.validateTitle(data.title);
    const banner = await this.banners.create(data);
    await this.events.publish({ type: "content.published", banner });
    return banner;
  }

  async updateBanner(data: UpdateBannerRequest): Promise<BannerDTO> {
    if (data.title !== undefined) this.validateTitle(data.title);
    const banner = await this.banners.update(data);
    await this.events.publish({ type: "content.published", banner });
    return banner;
  }

  private validateTitle(title: string): void {
    if (!title?.trim() || title.trim().length < 2) {
      throw new BannerValidationError("Title must be at least 2 characters", "title");
    }
  }
}
