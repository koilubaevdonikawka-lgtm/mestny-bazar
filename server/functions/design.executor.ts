import type { BannerDTO, CreateBannerRequest, UpdateBannerRequest } from "@shared/contracts/banner";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "design";

export async function executeListBanners(): Promise<BannerDTO[]> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().bannerService.listAllBanners();
}

export async function executeCreateBanner(data: CreateBannerRequest): Promise<BannerDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().bannerService.createBanner(data);
}

export async function executeUpdateBanner(data: UpdateBannerRequest): Promise<BannerDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().bannerService.updateBanner(data);
}
