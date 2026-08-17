import { describe, expect, it } from "vitest";
import { StubAiProvider } from "@server/adapters/ai/stub-ai-provider";

describe("StubAiProvider", () => {
  it("throws when asked to translate text", async () => {
    const provider = new StubAiProvider();

    await expect(provider.translateText({ text: "привет", targetLanguage: "en" })).rejects.toThrow(
      "No AI provider is configured",
    );
  });
});
