export type UserRole = "admin" | "customer" | "warehouse" | "courier" | "seller";

export interface ProfileDTO {
  id: string;
  fullName: string | null;
  phone: string | null;
  roles: UserRole[];
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}
