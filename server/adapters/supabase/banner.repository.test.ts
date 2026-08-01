import { describe, expect, it } from "vitest";
import { mapBannerRow } from "@server/adapters/supabase/banner.repository";

describe("mapBannerRow", () => {
  it("maps snake_case DB fields to the camelCase BannerDTO shape", () => {
    expect(
      mapBannerRow({
        id: "banner-1",
        title: "Летняя акция",
        subtitle: "Скидки на овощи",
        image_url: "https://example.com/banner.jpg",
        link_url: "/#products",
        sort_order: 1,
        starts_at: "2026-06-01T00:00:00.000Z",
        ends_at: "2026-08-31T00:00:00.000Z",
        is_active: true,
      }),
    ).toEqual({
      id: "banner-1",
      title: "Летняя акция",
      subtitle: "Скидки на овощи",
      imageUrl: "https://example.com/banner.jpg",
      linkUrl: "/#products",
      sortOrder: 1,
      startsAt: "2026-06-01T00:00:00.000Z",
      endsAt: "2026-08-31T00:00:00.000Z",
      isActive: true,
    });
  });

  it("maps a banner with no display period or link", () => {
    const mapped = mapBannerRow({
      id: "banner-2",
      title: "Постоянный баннер",
      subtitle: null,
      image_url: null,
      link_url: null,
      sort_order: 0,
      starts_at: null,
      ends_at: null,
      is_active: true,
    });

    expect(mapped.startsAt).toBeNull();
    expect(mapped.endsAt).toBeNull();
    expect(mapped.linkUrl).toBeNull();
  });
});
