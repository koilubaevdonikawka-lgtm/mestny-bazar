export interface SupplierDTO {
  id: string;
  name: string;
  contactPhone: string | null;
  contactPerson: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface CreateSupplierRequest {
  name: string;
  contactPhone?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  id: string;
  isActive?: boolean;
}

export const SupplyStatus = {
  DRAFT: "DRAFT",
  SENT: "SENT",
  CONFIRMED: "CONFIRMED",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
} as const;

export type SupplyStatus = (typeof SupplyStatus)[keyof typeof SupplyStatus];

export interface SupplyItemDTO {
  id: string;
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface SupplyDTO {
  id: string;
  supplierId: string;
  status: SupplyStatus;
  expectedAt: string | null;
  items: SupplyItemDTO[];
  createdAt: string;
}

export interface CreateSupplyItemRequest {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface CreateSupplyRequest {
  supplierId: string;
  expectedAt?: string;
  items: CreateSupplyItemRequest[];
}
