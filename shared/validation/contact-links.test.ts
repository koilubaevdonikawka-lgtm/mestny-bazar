import { describe, expect, it } from "vitest";
import { normalizeTelegramLink, normalizeWhatsappLink } from "@shared/validation/contact-links";

describe("normalizeTelegramLink", () => {
  it("keeps a full t.me link and forces https", () => {
    expect(normalizeTelegramLink("https://t.me/kantbazar")).toBe("https://t.me/kantbazar");
    expect(normalizeTelegramLink("http://t.me/kantbazar")).toBe("https://t.me/kantbazar");
    expect(normalizeTelegramLink(" https://t.me/kantbazar_bot?start=info ")).toBe(
      "https://t.me/kantbazar_bot?start=info",
    );
  });

  it("accepts a link without scheme, @username and a bare username", () => {
    expect(normalizeTelegramLink("t.me/kantbazar")).toBe("https://t.me/kantbazar");
    expect(normalizeTelegramLink("@kantbazar")).toBe("https://t.me/kantbazar");
    expect(normalizeTelegramLink("kantbazar")).toBe("https://t.me/kantbazar");
  });

  it("rejects junk and any non-https scheme", () => {
    for (const bad of [
      "",
      "   ",
      "javascript:alert(1)",
      "hello world",
      "https://evil.com/x",
      "t.me/",
      "ab",
      "data:text/html,x",
    ]) {
      expect(normalizeTelegramLink(bad)).toBeNull();
    }
  });
});

describe("normalizeWhatsappLink", () => {
  it("keeps a wa.me link and forces https", () => {
    expect(normalizeWhatsappLink("https://wa.me/996555123456")).toBe("https://wa.me/996555123456");
    expect(normalizeWhatsappLink("wa.me/996555123456")).toBe("https://wa.me/996555123456");
    expect(normalizeWhatsappLink("https://chat.whatsapp.com/AbCdEf")).toBe(
      "https://chat.whatsapp.com/AbCdEf",
    );
  });

  it("turns an international phone number into a wa.me link", () => {
    expect(normalizeWhatsappLink("+996 555 123 456")).toBe("https://wa.me/996555123456");
    expect(normalizeWhatsappLink("996-555-123-456")).toBe("https://wa.me/996555123456");
  });

  it("rejects junk, local numbers with a leading 0, and any other scheme/host", () => {
    for (const bad of [
      "",
      "abc",
      "0555123456",
      "12345",
      "javascript:alert(1)",
      "https://evil.com/996555123456",
      "+996 555 abc",
    ]) {
      expect(normalizeWhatsappLink(bad)).toBeNull();
    }
  });
});
