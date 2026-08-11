import { describe, expect, it } from "vitest";
import { createAiProvider, createAiImageProvider } from "@server/adapters/ai/ai-provider.factory";
import { GoogleAiAdapter } from "@server/adapters/ai/google-ai.adapter";
import { GoogleAiImageAdapter } from "@server/adapters/ai/google-ai-image.adapter";
import { StubAiProvider, StubAiImageProvider } from "@server/adapters/ai/stub-ai-provider";
import type { ServerEnv } from "@server/config/env";

function makeEnv(overrides: Partial<ServerEnv> = {}): ServerEnv {
  return {
    APP_NAME: "Местный Базар",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    ...overrides,
  };
}

describe("createAiProvider", () => {
  it("returns GoogleAiAdapter when GOOGLE_AI_API_KEY is configured", () => {
    const provider = createAiProvider(makeEnv({ GOOGLE_AI_API_KEY: "api-key" }));

    expect(provider).toBeInstanceOf(GoogleAiAdapter);
  });

  it("returns StubAiProvider when GOOGLE_AI_API_KEY is missing", () => {
    const provider = createAiProvider(makeEnv());

    expect(provider).toBeInstanceOf(StubAiProvider);
  });
});

describe("createAiImageProvider", () => {
  it("returns GoogleAiImageAdapter when GOOGLE_AI_API_KEY is configured", () => {
    const provider = createAiImageProvider(makeEnv({ GOOGLE_AI_API_KEY: "api-key" }));

    expect(provider).toBeInstanceOf(GoogleAiImageAdapter);
  });

  it("returns StubAiImageProvider when GOOGLE_AI_API_KEY is missing", () => {
    const provider = createAiImageProvider(makeEnv());

    expect(provider).toBeInstanceOf(StubAiImageProvider);
  });
});
