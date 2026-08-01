import type { BannerDTO, CreateBannerRequest, UpdateBannerRequest } from "@shared/contracts/banner";
import {
  createBannerFn,
  listActiveBannersFn,
  listBannersFn,
  updateBannerFn,
} from "@/api/design.functions";

export async function listActiveBanners(): Promise<BannerDTO[]> {
  return listActiveBannersFn();
}

export async function listBanners(): Promise<BannerDTO[]> {
  return listBannersFn();
}

export async function createBanner(request: CreateBannerRequest): Promise<BannerDTO> {
  return createBannerFn({ data: request });
}

export async function updateBanner(request: UpdateBannerRequest): Promise<BannerDTO> {
  return updateBannerFn({ data: request });
}
