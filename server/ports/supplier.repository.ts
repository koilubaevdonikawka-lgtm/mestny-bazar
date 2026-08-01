import type {
  CreateSupplierRequest,
  SupplierDTO,
  UpdateSupplierRequest,
} from "@shared/contracts/supplier";

export interface ISupplierRepository {
  list(): Promise<SupplierDTO[]>;
  getById(id: string): Promise<SupplierDTO | null>;
  create(data: CreateSupplierRequest): Promise<SupplierDTO>;
  update(data: UpdateSupplierRequest): Promise<SupplierDTO>;
}
