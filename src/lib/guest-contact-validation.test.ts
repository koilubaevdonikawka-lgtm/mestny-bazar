import { describe, expect, it } from "vitest";
import { validateGuestContact } from "@/lib/guest-contact-validation";

describe("validateGuestContact", () => {
  it("accepts a full address and a 9+ digit phone in any format", () => {
    expect(
      validateGuestContact({ address: "Кант, Ленина 1", phone: "+996 (700) 12-34-56" }),
    ).toEqual({
      addressValid: true,
      phoneValid: true,
    });
  });

  it("flags an empty or too short address (under 5 characters after trimming)", () => {
    expect(validateGuestContact({ address: "", phone: "996700123456" }).addressValid).toBe(false);
    expect(validateGuestContact({ address: "  Ош  ", phone: "996700123456" }).addressValid).toBe(
      false,
    );
  });

  it("flags an empty phone or one with fewer than 9 digits", () => {
    expect(validateGuestContact({ address: "Кант, Ленина 1", phone: "" }).phoneValid).toBe(false);
    expect(validateGuestContact({ address: "Кант, Ленина 1", phone: "+996 70" }).phoneValid).toBe(
      false,
    );
  });
});
