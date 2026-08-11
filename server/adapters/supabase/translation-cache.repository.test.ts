import { describe, expect, it } from "vitest";
import { hashSourceText } from "@server/adapters/supabase/translation-cache.repository";

describe("hashSourceText", () => {
  it("is deterministic — the same text always hashes the same way", () => {
    expect(hashSourceText("Овощи и фрукты")).toBe(hashSourceText("Овощи и фрукты"));
  });

  it("produces different hashes for different text", () => {
    expect(hashSourceText("Овощи и фрукты")).not.toBe(hashSourceText("Молочные продукты"));
  });

  it("is sensitive to any change in the source text (no accidental collisions)", () => {
    expect(hashSourceText("Овощи")).not.toBe(hashSourceText("Овощи "));
  });
});
