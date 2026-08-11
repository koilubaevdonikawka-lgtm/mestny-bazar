import { createServerFn } from "@tanstack/react-start";
import type { TranslateTextResult } from "@shared/contracts/ai-provider";
import { translateTextRequestSchema } from "@shared/validation/ai-provider.schema";

export const translateTextFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => translateTextRequestSchema.parse(data))
  .handler(async ({ data }): Promise<TranslateTextResult> => {
    const { executeTranslateText } = await import("@server/functions/ai-translation.executor");
    return executeTranslateText(data);
  });
