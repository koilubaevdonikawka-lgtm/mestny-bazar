import { describe, expect, it } from "vitest";
import type { ProductPublicationContext } from "@server/ports/product-publication.port";
import { ProductPublicationStatus } from "@shared/contracts/seller-product";

import { BootstrapDraftRule } from "@server/domain/product-publication/rules/bootstrap-draft.rule";
import { SellerPublishRule } from "@server/domain/product-publication/rules/seller-publish.rule";
import { SellerHideRule } from "@server/domain/product-publication/rules/seller-hide.rule";
import { AdminFullControlRule } from "@server/domain/product-publication/rules/admin-full-control.rule";

function ctx(overrides: Partial<ProductPublicationContext>): ProductPublicationContext {
  return {
    productId: "product-1",
    currentStatus: ProductPublicationStatus.DRAFT,
    targetStatus: ProductPublicationStatus.DRAFT,
    actor: { id: "seller-1" },
    ...overrides,
  };
}

describe("BootstrapDraftRule", () => {
  const rule = new BootstrapDraftRule();

  it("applies only to seller_create -> DRAFT", () => {
    expect(
      rule.applies(ctx({ reason: "seller_create", targetStatus: ProductPublicationStatus.DRAFT })),
    ).toBe(true);
    expect(rule.applies(ctx({ reason: "seller_publish" }))).toBe(false);
  });

  it("always allows", () => {
    expect(rule.evaluate(ctx({})).allowed).toBe(true);
  });
});

describe("SellerPublishRule", () => {
  const rule = new SellerPublishRule();
  const applyCtx = { reason: "seller_publish", targetStatus: ProductPublicationStatus.PUBLISHED };

  it("applies only to seller_publish -> PUBLISHED", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(rule.applies(ctx({ reason: "seller_hide" }))).toBe(false);
  });

  it("allows from DRAFT or HIDDEN", () => {
    expect(
      rule.evaluate(ctx({ ...applyCtx, currentStatus: ProductPublicationStatus.DRAFT })).allowed,
    ).toBe(true);
    expect(
      rule.evaluate(ctx({ ...applyCtx, currentStatus: ProductPublicationStatus.HIDDEN })).allowed,
    ).toBe(true);
  });

  it("denies from PUBLISHED (already published)", () => {
    const result = rule.evaluate(
      ctx({ ...applyCtx, currentStatus: ProductPublicationStatus.PUBLISHED }),
    );
    expect(result).toMatchObject({ allowed: false, denialCode: "INVALID_PUBLISH_TRANSITION" });
  });
});

describe("SellerHideRule", () => {
  const rule = new SellerHideRule();
  const applyCtx = { reason: "seller_hide", targetStatus: ProductPublicationStatus.HIDDEN };

  it("applies only to seller_hide -> HIDDEN", () => {
    expect(rule.applies(ctx(applyCtx))).toBe(true);
    expect(rule.applies(ctx({ reason: "seller_publish" }))).toBe(false);
  });

  it("allows only from PUBLISHED", () => {
    expect(
      rule.evaluate(ctx({ ...applyCtx, currentStatus: ProductPublicationStatus.PUBLISHED }))
        .allowed,
    ).toBe(true);
  });

  it("denies from DRAFT or HIDDEN", () => {
    for (const status of [ProductPublicationStatus.DRAFT, ProductPublicationStatus.HIDDEN]) {
      const result = rule.evaluate(ctx({ ...applyCtx, currentStatus: status }));
      expect(result).toMatchObject({ allowed: false, denialCode: "INVALID_HIDE_TRANSITION" });
    }
  });
});

describe("AdminFullControlRule", () => {
  const rule = new AdminFullControlRule();

  it("applies to admin_create and admin_update, but not seller reasons", () => {
    expect(rule.applies(ctx({ reason: "admin_create" }))).toBe(true);
    expect(rule.applies(ctx({ reason: "admin_update" }))).toBe(true);
    expect(rule.applies(ctx({ reason: "seller_create" }))).toBe(false);
  });

  it("always allows, for any target status", () => {
    for (const status of [
      ProductPublicationStatus.DRAFT,
      ProductPublicationStatus.PUBLISHED,
      ProductPublicationStatus.HIDDEN,
    ]) {
      expect(rule.evaluate(ctx({ reason: "admin_create", targetStatus: status })).allowed).toBe(
        true,
      );
    }
  });
});
