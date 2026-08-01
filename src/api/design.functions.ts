import { createServerFn } from "@tanstack/react-start";
import type { BannerDTO } from "@shared/contracts/banner";
import {
  createBannerRequestSchema,
  updateBannerRequestSchema,
} from "@shared/validation/banner.schema";

/** Storefront-facing — no auth, mirrors listCategoriesFn (public read, no dedicated executor). */
export const listActiveBannersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<BannerDTO[]> => {
    const { getServices } = await import("@server/di/container");
    return getServices().bannerService.listActiveBanners();
  },
);

export const listBannersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<BannerDTO[]> => {
    const { executeListBanners } = await import("@server/functions/design.executor");
    return executeListBanners();
  },
);

export const createBannerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createBannerRequestSchema.parse(data))
  .handler(async ({ data }): Promise<BannerDTO> => {
    const { executeCreateBanner } = await import("@server/functions/design.executor");
    return executeCreateBanner(data);
  });

export const updateBannerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateBannerRequestSchema.parse(data))
  .handler(async ({ data }): Promise<BannerDTO> => {
    const { executeUpdateBanner } = await import("@server/functions/design.executor");
    return executeUpdateBanner(data);
  });
