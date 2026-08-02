import type { AutomationOverviewDTO } from "@shared/contracts/automation";
import { getAutomationOverviewFn } from "@/api/automation.functions";

export async function getAutomationOverview(): Promise<AutomationOverviewDTO> {
  return getAutomationOverviewFn();
}
