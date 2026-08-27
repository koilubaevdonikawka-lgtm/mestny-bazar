import type { ProfileDTO, UpdateProfileRequest } from "@shared/contracts/user";
import { getMyProfileFn, updateMyProfileFn } from "@/api/profile.functions";

export async function getMyProfile(): Promise<ProfileDTO> {
  return getMyProfileFn();
}

export async function updateMyProfile(data: UpdateProfileRequest): Promise<ProfileDTO> {
  return updateMyProfileFn({ data });
}
