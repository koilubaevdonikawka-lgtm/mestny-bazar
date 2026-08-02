import { describe, expect, it } from "vitest";
import { AutomationOverviewService } from "@server/domain/automation-overview.service";

describe("AutomationOverviewService.getOverview", () => {
  it("returns a non-empty, deduplicated catalog of event types", () => {
    const service = new AutomationOverviewService();
    const overview = service.getOverview();

    expect(overview.events.length).toBeGreaterThan(0);
    const types = overview.events.map((e) => e.eventType);
    expect(new Set(types).size).toBe(types.length);
  });

  it("marks known orphaned AI-result events with no subscribers (ai.md's documented gap)", () => {
    const service = new AutomationOverviewService();
    const overview = service.getOverview();

    const orphaned = overview.events.find((e) => e.eventType === "catalog.analysis.completed");
    expect(orphaned?.subscribers).toEqual([]);
  });

  it("includes the in-memory bus architecture note", () => {
    const service = new AutomationOverviewService();
    const overview = service.getOverview();

    expect(overview.architectureNote).toMatch(/in-memory/i);
  });
});
