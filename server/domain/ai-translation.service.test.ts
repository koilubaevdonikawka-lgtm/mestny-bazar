import { describe, expect, it, vi } from "vitest";
import { AiTranslationService } from "@server/domain/ai-translation.service";
import { AiProviderError, InvalidTranslationRequestError } from "@server/domain/ai.errors";
import type { IAiTextProvider } from "@server/ports/ai-provider.port";

function makeProvider(overrides: Partial<IAiTextProvider> = {}): IAiTextProvider {
  return {
    translateText: vi.fn().mockResolvedValue({
      translatedText: "hello",
      detectedSourceLanguage: "ru",
    }),
    ...overrides,
  };
}

describe("AiTranslationService", () => {
  it("delegates to the provider and returns its result", async () => {
    const provider = makeProvider();
    const service = new AiTranslationService(provider);

    const result = await service.translate({ text: "привет", targetLanguage: "en" });

    expect(result).toEqual({ translatedText: "hello", detectedSourceLanguage: "ru" });
    expect(provider.translateText).toHaveBeenCalledWith({
      text: "привет",
      targetLanguage: "en",
    });
  });

  it("trims text and targetLanguage before calling the provider", async () => {
    const provider = makeProvider();
    const service = new AiTranslationService(provider);

    await service.translate({ text: "  привет  ", targetLanguage: "  en  " });

    expect(provider.translateText).toHaveBeenCalledWith({
      text: "привет",
      targetLanguage: "en",
    });
  });

  it("rejects empty text without calling the provider", async () => {
    const provider = makeProvider();
    const service = new AiTranslationService(provider);

    await expect(service.translate({ text: "   ", targetLanguage: "en" })).rejects.toThrow(
      InvalidTranslationRequestError,
    );
    expect(provider.translateText).not.toHaveBeenCalled();
  });

  it("rejects empty targetLanguage without calling the provider", async () => {
    const provider = makeProvider();
    const service = new AiTranslationService(provider);

    await expect(service.translate({ text: "привет", targetLanguage: "   " })).rejects.toThrow(
      InvalidTranslationRequestError,
    );
    expect(provider.translateText).not.toHaveBeenCalled();
  });

  it("wraps any provider failure in AiProviderError", async () => {
    const provider = makeProvider({
      translateText: vi.fn().mockRejectedValue(new Error("network down")),
    });
    const service = new AiTranslationService(provider);

    await expect(service.translate({ text: "привет", targetLanguage: "en" })).rejects.toThrow(
      AiProviderError,
    );
  });
});
