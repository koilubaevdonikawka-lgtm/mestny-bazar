import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type {
  CreateSupplierRequest,
  SupplierDTO,
  UpdateSupplierRequest,
} from "@shared/contracts/supplier";
import { SupplierNotFoundError, SupplierValidationError } from "@server/domain/supplier.errors";

/** Supplier list management (suppliers.md) — Admin-only, a wholly new domain. */
export class SupplierService {
  constructor(private readonly suppliers: ISupplierRepository) {}

  async listSuppliers(): Promise<SupplierDTO[]> {
    return this.suppliers.list();
  }

  async getSupplier(id: string): Promise<SupplierDTO> {
    const supplier = await this.suppliers.getById(id);
    if (!supplier) throw new SupplierNotFoundError();
    return supplier;
  }

  async createSupplier(data: CreateSupplierRequest): Promise<SupplierDTO> {
    this.validateName(data.name);
    return this.suppliers.create(data);
  }

  async updateSupplier(data: UpdateSupplierRequest): Promise<SupplierDTO> {
    const existing = await this.suppliers.getById(data.id);
    if (!existing) throw new SupplierNotFoundError();
    if (data.name !== undefined) this.validateName(data.name);
    return this.suppliers.update(data);
  }

  private validateName(name: string): void {
    if (!name?.trim() || name.trim().length < 2) {
      throw new SupplierValidationError("Name must be at least 2 characters", "name");
    }
  }
}
