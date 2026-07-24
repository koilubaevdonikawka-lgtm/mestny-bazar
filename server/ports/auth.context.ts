export type UserRole = "admin" | "customer" | "warehouse" | "courier" | "seller";

export interface IAuthContext {
  getUserId(): string | null;
  requireAuth(): string;
  requireRole(role: UserRole): string;
  hasRole(role: UserRole): boolean;
}
