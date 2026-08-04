import type { AccessProfileDTO } from "@shared/contracts/access-profile";
import { getAccessProfileFn } from "@/api/access-profile.functions";

export async function getAccessProfile(): Promise<AccessProfileDTO> {
  return getAccessProfileFn();
}
