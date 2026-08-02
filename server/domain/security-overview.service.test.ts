import { describe, expect, it } from "vitest";
import { SecurityOverviewService } from "@server/domain/security-overview.service";

describe("SecurityOverviewService.getOverview", () => {
  it("reports every perimeter item as implemented (already-existing mechanisms)", () => {
    const service = new SecurityOverviewService();
    const overview = service.getOverview();

    expect(overview.perimeter.length).toBeGreaterThan(0);
    expect(overview.perimeter.every((item) => item.status === "IMPLEMENTED")).toBe(true);
  });

  it("honestly lists rate limiting as a known, unimplemented gap", () => {
    const service = new SecurityOverviewService();
    const overview = service.getOverview();

    expect(overview.gaps.some((gap) => gap.name === "Rate limiting")).toBe(true);
  });
});
