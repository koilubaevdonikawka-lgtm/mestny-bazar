import { describe, expect, it } from "vitest";
import { SecurityOverviewService } from "@server/domain/security-overview.service";

describe("SecurityOverviewService.getOverview", () => {
  it("reports every perimeter item as implemented (already-existing mechanisms)", () => {
    const service = new SecurityOverviewService();
    const overview = service.getOverview();

    expect(overview.perimeter.length).toBeGreaterThan(0);
    expect(overview.perimeter.every((item) => item.status === "IMPLEMENTED")).toBe(true);
  });

  it("reports rate limiting as implemented (Задача №288), no longer a known gap", () => {
    const service = new SecurityOverviewService();
    const overview = service.getOverview();

    expect(overview.gaps.some((gap) => gap.name === "Rate limiting")).toBe(false);
    expect(
      overview.perimeter.some(
        (item) => item.name === "Rate limiting" && item.status === "IMPLEMENTED",
      ),
    ).toBe(true);
  });
});
