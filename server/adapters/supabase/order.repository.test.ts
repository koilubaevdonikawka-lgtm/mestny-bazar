import { describe, expect, it } from "vitest";
import {
  decodePaymentMethodNote,
  encodePaymentMethodNote,
  mergeNotes,
} from "@server/adapters/supabase/order.repository";

describe("payment method note encoding (order notes sideband channel)", () => {
  it("round-trips ONLINE and CASH through merge/decode with no user notes", () => {
    expect(decodePaymentMethodNote(mergeNotes(undefined, "ONLINE"))).toBe("ONLINE");
    expect(decodePaymentMethodNote(mergeNotes(undefined, "CASH"))).toBe("CASH");
  });

  it("round-trips correctly alongside real user notes", () => {
    const merged = mergeNotes("Leave at the door, ring twice", "ONLINE");
    expect(decodePaymentMethodNote(merged)).toBe("ONLINE");
  });

  it("defaults to CASH when there are no notes at all", () => {
    expect(decodePaymentMethodNote(null)).toBe("CASH");
  });

  // Regression test: request.notes is client-controlled free text (CheckoutService
  // passes it straight through). A customer note containing the literal tag text
  // must never be able to spoof the decoded payment method for an order that was
  // actually placed with the other method — this would misreport payment method on
  // every later read (admin/courier/warehouse views, reconciliation).
  it("is not spoofable by user note text containing the tag for the OTHER payment method", () => {
    const spoofAttempt = mergeNotes("Note: payment_method:ONLINE please refund via card", "CASH");
    expect(decodePaymentMethodNote(spoofAttempt)).toBe("CASH");
  });

  it("is not spoofable when the user's note itself ends with a fake tag on its own line", () => {
    const spoofAttempt = mergeNotes("Some note\npayment_method:ONLINE", "CASH");
    expect(decodePaymentMethodNote(spoofAttempt)).toBe("CASH");
  });

  it("still round-trips ONLINE correctly when user notes contain an unrelated CASH-like string", () => {
    const merged = mergeNotes(
      "I'll pay payment_method:CASH style but really paying online",
      "ONLINE",
    );
    expect(decodePaymentMethodNote(merged)).toBe("ONLINE");
  });

  it("falls back to CASH for a raw notes string that never had a real tag appended", () => {
    expect(decodePaymentMethodNote("just a plain customer note")).toBe("CASH");
  });

  it("encodePaymentMethodNote produces the exact tag format decodePaymentMethodNote expects", () => {
    expect(encodePaymentMethodNote("ONLINE")).toBe("payment_method:ONLINE");
    expect(decodePaymentMethodNote(encodePaymentMethodNote("ONLINE"))).toBe("ONLINE");
  });
});
