import { describe, expect, it } from "vitest";
import { mapSellerProfileRow } from "@server/adapters/supabase/seller-profile.repository";

describe("mapSellerProfileRow", () => {
  it("maps a full row", () => {
    expect(
      mapSellerProfileRow({
        user_id: "seller-1",
        store_name: "Кант Базар",
        contact_phone: "+996700000000",
        verification_status: "VERIFIED",
        payout_details: "IBAN ...",
        created_at: "2026-08-01T00:00:00.000Z",
      }),
    ).toEqual({
      userId: "seller-1",
      storeName: "Кант Базар",
      contactPhone: "+996700000000",
      verificationStatus: "VERIFIED",
      payoutDetails: "IBAN ...",
      createdAt: "2026-08-01T00:00:00.000Z",
    });
  });

  it("preserves null contact_phone/payout_details", () => {
    const mapped = mapSellerProfileRow({
      user_id: "seller-2",
      store_name: "New Store",
      contact_phone: null,
      verification_status: "PENDING",
      payout_details: null,
      created_at: "2026-08-01T00:00:00.000Z",
    });

    expect(mapped.contactPhone).toBeNull();
    expect(mapped.payoutDetails).toBeNull();
    expect(mapped.verificationStatus).toBe("PENDING");
  });
});
