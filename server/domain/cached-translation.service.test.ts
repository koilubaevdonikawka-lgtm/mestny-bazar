import { describe, expect, it, vi } from "vitest";
import { CachedTranslationService } from "@server/domain/cached-translation.service";
import type { ITranslationCache } from "@server/ports/translation-cache.port";
import type { AiTranslationService } from "@server/domain/ai-translation.service";

function makeCache(overrides: Partial<ITranslationCache> = {}): ITranslationCache {
  return {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeTranslator(overrides: Partial<AiTranslationService> = {}): AiTranslationService {
  return {
    translate: vi.fn().mockResolvedValue({
      translatedText: "Vegetables and fruits",
      detectedSourceLanguage: null,
    }),
    ...overrides,
  } as AiTranslationService;
}

describe("CachedTranslationService", () => {
  it("returns the cached translation and never calls the AI translator on a cache hit", async () => {
    const cache = makeCache({ get: vi.fn().mockResolvedValue("Овощи (cached)") });
    const translator = makeTranslator();
    const service = new CachedTranslationService(cache, translator);

    const result = await service.translate({
      text: "Овощи",
      targetLanguage: "en",
      sourceLanguage: "ru",
    });

    expect(result).toEqual({ translatedText: "Овощи (cached)", detectedSourceLanguage: "ru" });
    expect(translator.translate).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
  });

  it("calls the AI translator and stores the result on a cache miss", async () => {
    const cache = makeCache();
    const translator = makeTranslator();
    const service = new CachedTranslationService(cache, translator);

    const result = await service.translate({
      text: "Овощи",
      targetLanguage: "en",
      sourceLanguage: "ru",
    });

    expect(result.translatedText).toBe("Vegetables and fruits");
    expect(translator.translate).toHaveBeenCalledWith({
      text: "Овощи",
      targetLanguage: "en",
      sourceLanguage: "ru",
    });
    expect(cache.set).toHaveBeenCalledWith({
      sourceText: "Овощи",
      sourceLanguage: "ru",
      targetLanguage: "en",
      translatedText: "Vegetables and fruits",
    });
  });

  it("uses 'auto' as the cache-key source language when none is given", async () => {
    const cache = makeCache();
    const translator = makeTranslator();
    const service = new CachedTranslationService(cache, translator);

    await service.translate({ text: "Овощи", targetLanguage: "en" });

    expect(cache.get).toHaveBeenCalledWith({
      sourceText: "Овощи",
      sourceLanguage: "auto",
      targetLanguage: "en",
    });
  });

  it("falls back to calling the AI translator when the cache read fails", async () => {
    const cache = makeCache({ get: vi.fn().mockRejectedValue(new Error("db down")) });
    const translator = makeTranslator();
    const service = new CachedTranslationService(cache, translator);

    const result = await service.translate({ text: "Овощи", targetLanguage: "en" });

    expect(result.translatedText).toBe("Vegetables and fruits");
    expect(translator.translate).toHaveBeenCalled();
  });

  it("still returns the translation when the cache write fails", async () => {
    const cache = makeCache({ set: vi.fn().mockRejectedValue(new Error("db down")) });
    const translator = makeTranslator();
    const service = new CachedTranslationService(cache, translator);

    const result = await service.translate({ text: "Овощи", targetLanguage: "en" });

    expect(result.translatedText).toBe("Vegetables and fruits");
  });
});
