import type { SecurityOverviewDTO } from "@shared/contracts/security";
import { getSecurityOverviewFn } from "@/api/security-overview.functions";

export async function getSecurityOverview(): Promise<SecurityOverviewDTO> {
  return getSecurityOverviewFn();
}
