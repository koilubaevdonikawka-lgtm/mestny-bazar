import { createServerFn } from "@tanstack/react-start";
import type { SellerProfileDTO } from "@shared/contracts/seller-profile";
import {
  sellerUserIdParamSchema,
  upsertSellerProfileRequestSchema,
} from "@shared/validation/seller-profile.schema";

export const listSellersFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SellerProfileDTO[]> => {
    const { executeListSellers } = await import("@server/functions/seller-profile.executor");
    return executeListSellers();
  },
);

export const getSellerProfileFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => sellerUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProfileDTO> => {
    const { executeGetSellerProfile } = await import("@server/functions/seller-profile.executor");
    return executeGetSellerProfile(data.userId);
  });

export const getMySellerProfileFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SellerProfileDTO | null> => {
    const { executeGetMySellerProfile } = await import("@server/functions/seller-profile.executor");
    return executeGetMySellerProfile();
  },
);

export const upsertMySellerProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => upsertSellerProfileRequestSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProfileDTO> => {
    const { executeUpsertMySellerProfile } =
      await import("@server/functions/seller-profile.executor");
    return executeUpsertMySellerProfile(data);
  });

export const verifySellerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => sellerUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProfileDTO> => {
    const { executeVerifySeller } = await import("@server/functions/seller-profile.executor");
    return executeVerifySeller(data.userId);
  });

export const rejectSellerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => sellerUserIdParamSchema.parse(data))
  .handler(async ({ data }): Promise<SellerProfileDTO> => {
    const { executeRejectSeller } = await import("@server/functions/seller-profile.executor");
    return executeRejectSeller(data.userId);
  });
