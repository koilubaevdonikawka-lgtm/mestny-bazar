import { describe, expect, it, vi } from "vitest";
import { SupplierService } from "@server/domain/supplier.service";
import { SupplierNotFoundError, SupplierValidationError } from "@server/domain/supplier.errors";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { SupplierDTO } from "@shared/contracts/supplier";

function makeSupplier(overrides: Partial<SupplierDTO> = {}): SupplierDTO {
  return {
    id: "supplier-1",
    name: "ОсОО Молоко",
    contactPhone: null,
    contactPerson: null,
    notes: null,
    isActive: true,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<ISupplierRepository> = {}): ISupplierRepository {
  return {
    list: vi.fn(async () => []),
    getById: vi.fn(async () => makeSupplier()),
    create: vi.fn(async () => makeSupplier()),
    update: vi.fn(async () => makeSupplier()),
    ...overrides,
  };
}

describe("SupplierService.createSupplier", () => {
  it("rejects a name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new SupplierService(repo);

    await expect(service.createSupplier({ name: "A" })).rejects.toBeInstanceOf(
      SupplierValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("delegates to the repository when valid", async () => {
    const repo = fakeRepo();
    const service = new SupplierService(repo);

    await service.createSupplier({ name: "ОсОО Молоко" });
    expect(repo.create).toHaveBeenCalledWith({ name: "ОсОО Молоко" });
  });
});

describe("SupplierService.updateSupplier", () => {
  it("throws SupplierNotFoundError when the supplier does not exist", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SupplierService(repo);

    await expect(service.updateSupplier({ id: "missing" })).rejects.toBeInstanceOf(
      SupplierNotFoundError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates a new name before delegating to the repository", async () => {
    const repo = fakeRepo();
    const service = new SupplierService(repo);

    await expect(service.updateSupplier({ id: "supplier-1", name: "A" })).rejects.toBeInstanceOf(
      SupplierValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe("SupplierService.getSupplier", () => {
  it("throws SupplierNotFoundError when missing", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new SupplierService(repo);

    await expect(service.getSupplier("missing")).rejects.toBeInstanceOf(SupplierNotFoundError);
  });
});
