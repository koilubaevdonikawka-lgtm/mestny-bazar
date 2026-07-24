import type { ProductPublicationStatus } from "@shared/contracts/seller-product";
import type { UserRole } from "@shared/contracts/user";

export type ProductPublicationDenialCode = string;

export interface ProductPublicationActor {
  id: string;
  roles?: UserRole[];
}

export interface ProductPublicationContext {
  productId: string;
  currentStatus: ProductPublicationStatus;
  targetStatus: ProductPublicationStatus;
  actor: ProductPublicationActor;
  reason?: string;
}

export interface ProductPublicationResult {
  allowed: boolean;
  denialCode?: ProductPublicationDenialCode;
  message?: string;
}

export interface IProductPublicationPolicy {
  canTransition(context: ProductPublicationContext): ProductPublicationResult;
  assertCanTransition(context: ProductPublicationContext): void;
}
