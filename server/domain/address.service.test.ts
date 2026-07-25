import { describe, expect, it, vi } from "vitest";
import { AddressService } from "@server/domain/address.service";
import { AddressNotFoundError, AddressValidationError } from "@server/domain/address.errors";
import type { IAddressRepository } from "@server/ports/address.repository";
import type { AddressDTO } from "@shared/contracts/delivery";

function makeAddress(overrides: Partial<AddressDTO> = {}): AddressDTO {
  return {
    id: "address-1",
    label: null,
    fullAddress: "г. Кант, ул. Ленина 12",
    city: null,
    district: null,
    notes: null,
    zoneId: null,
    isDefault: false,
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IAddressRepository> = {}): IAddressRepository {
  return {
    listByUser: vi.fn(async () => []),
    getById: vi.fn(async () => null),
    create: vi.fn(async () => makeAddress()),
    update: vi.fn(async () => makeAddress()),
    delete: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("AddressService.create", () => {
  it("rejects an address shorter than 5 characters", async () => {
    const repo = fakeRepo();
    const service = new AddressService(repo);

    await expect(service.create("user-1", { fullAddress: "abcd" })).rejects.toBeInstanceOf(
      AddressValidationError,
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("rejects a blank address", async () => {
    const repo = fakeRepo();
    const service = new AddressService(repo);

    await expect(service.create("user-1", { fullAddress: "   " })).rejects.toBeInstanceOf(
      AddressValidationError,
    );
  });

  it("creates the address when valid", async () => {
    const repo = fakeRepo();
    const service = new AddressService(repo);

    await service.create("user-1", { fullAddress: "г. Кант, ул. Ленина 12" });
    expect(repo.create).toHaveBeenCalledWith("user-1", { fullAddress: "г. Кант, ул. Ленина 12" });
  });
});

describe("AddressService.update", () => {
  it("throws AddressNotFoundError when the address does not belong to the user", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new AddressService(repo);

    await expect(
      service.update("user-1", { id: "address-1", fullAddress: "г. Кант, ул. Ленина 20" }),
    ).rejects.toBeInstanceOf(AddressNotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("validates a new fullAddress before delegating to the repository", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeAddress()) });
    const service = new AddressService(repo);

    await expect(
      service.update("user-1", { id: "address-1", fullAddress: "x" }),
    ).rejects.toBeInstanceOf(AddressValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("does not require fullAddress validation when it is not being changed", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeAddress()) });
    const service = new AddressService(repo);

    await service.update("user-1", { id: "address-1", label: "Дом" });
    expect(repo.update).toHaveBeenCalledWith("user-1", { id: "address-1", label: "Дом" });
  });
});

describe("AddressService.delete", () => {
  it("throws AddressNotFoundError instead of deleting an address owned by another user", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new AddressService(repo);

    await expect(service.delete("address-1", "user-1")).rejects.toBeInstanceOf(
      AddressNotFoundError,
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it("deletes when the address belongs to the user", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeAddress()) });
    const service = new AddressService(repo);

    await service.delete("address-1", "user-1");
    expect(repo.delete).toHaveBeenCalledWith("address-1", "user-1");
  });
});

describe("AddressService.getDefaultForUser", () => {
  it("returns the address flagged isDefault", async () => {
    const defaultAddress = makeAddress({ id: "a2", isDefault: true });
    const repo = fakeRepo({
      listByUser: vi.fn(async () => [makeAddress({ id: "a1" }), defaultAddress]),
    });
    const service = new AddressService(repo);

    const result = await service.getDefaultForUser("user-1");
    expect(result).toBe(defaultAddress);
  });

  it("returns null when the user has no default address", async () => {
    const repo = fakeRepo({ listByUser: vi.fn(async () => [makeAddress()]) });
    const service = new AddressService(repo);

    expect(await service.getDefaultForUser("user-1")).toBeNull();
  });
});

describe("AddressService.setDefault", () => {
  it("delegates to update with isDefault: true", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeAddress()) });
    const service = new AddressService(repo);

    await service.setDefault("address-1", "user-1");
    expect(repo.update).toHaveBeenCalledWith("user-1", { id: "address-1", isDefault: true });
  });
});
