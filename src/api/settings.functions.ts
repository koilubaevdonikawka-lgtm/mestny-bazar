import { createServerFn } from "@tanstack/react-start";
import type { PlatformSettingDTO } from "@shared/contracts/settings";
import { settingKeySchema, updateSettingRequestSchema } from "@shared/validation/settings.schema";

export const listSettingsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<PlatformSettingDTO[]> => {
    const { executeListSettings } = await import("@server/functions/settings.executor");
    return executeListSettings();
  },
);

export const getSettingFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => settingKeySchema.parse(data))
  .handler(async ({ data }): Promise<PlatformSettingDTO | null> => {
    const { executeGetSetting } = await import("@server/functions/settings.executor");
    return executeGetSetting(data.key);
  });

export const updateSettingFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateSettingRequestSchema.parse(data))
  .handler(async ({ data }): Promise<PlatformSettingDTO> => {
    const { executeUpdateSetting } = await import("@server/functions/settings.executor");
    return executeUpdateSetting(data);
  });
