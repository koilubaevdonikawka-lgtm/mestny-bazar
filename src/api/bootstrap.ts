import type { BootstrapStatusDTO } from "@shared/contracts/bootstrap";
import { claimBootstrapFn, getBootstrapStatusFn } from "@/api/bootstrap.functions";

export async function getBootstrapStatus(): Promise<BootstrapStatusDTO> {
  return getBootstrapStatusFn();
}

export async function claimBootstrap(): Promise<BootstrapStatusDTO> {
  return claimBootstrapFn();
}
