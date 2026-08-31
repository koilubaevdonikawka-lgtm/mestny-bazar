import type { BannerDTO, CreateBannerRequest, UpdateBannerRequest } from "@shared/contracts/banner";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { assertMarketingAccess } from "@server/auth/assert-marketing-access";
import { getServices } from "@server/di/container";

/** Задача №219 — moved from design.executor.ts (module "design") alongside the banner UI moving /admin/design -> /admin/marketing/banners; module is "marketing" now, via the real three-step scope check (assertMarketingAccess). */
export async function executeListBanners(): Promise<BannerDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().bannerService.listAllBanners();
}

export async function executeCreateBanner(data: CreateBannerRequest): Promise<BannerDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().bannerService.createBanner(data);
}

export async function executeUpdateBanner(data: UpdateBannerRequest): Promise<BannerDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  await assertMarketingAccess(userId, roles);
  return getServices().bannerService.updateBanner(data);
}
