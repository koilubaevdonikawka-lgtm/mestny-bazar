import { describe, expect, it, vi } from "vitest";
import { SellerProfileService } from "@server/domain/seller-profile.service";
import { SellerProfileValidationError } from "@server/domain/seller-profile.errors";
import type { ISellerProfileRepository } from "@server/ports/seller-profile.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { SellerProfileDTO } from "@shared/contracts/seller-profile";

function makeProfile(overrides: Partial<SellerProfileDTO> = {}): SellerProfileDTO {
  return {
    userId: "seller-1",
    storeName: "Кант Базар",
    contactPhone: null,
    verificationStatus: "PENDING",
    payoutDetails: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<ISellerProfileRepository> = {}): ISellerProfileRepository {
  return {
    listAll: vi.fn(async () => []),
    getByUserId: vi.fn(async () => null),
    upsert: vi.fn(async () => makeProfile()),
    setVerificationStatus: vi.fn(async () => makeProfile()),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("SellerProfileService.upsertOwnProfile", () => {
  it("rejects a store name shorter than 2 characters", async () => {
    const repo = fakeRepo();
    const service = new SellerProfileService(repo, fakeEventBus());

    await expect(service.upsertOwnProfile("seller-1", { storeName: "A" })).rejects.toBeInstanceOf(
      SellerProfileValidationError,
    );
    expect(repo.upsert).not.toHaveBeenCalled();
  });

  it("publishes seller.registered only on first creation, not on later updates", async () => {
    const events = fakeEventBus();

    const creatingRepo = fakeRepo({ getByUserId: vi.fn(async () => null) });
    await new SellerProfileService(creatingRepo, events).upsertOwnProfile("seller-1", {
      storeName: "Кант Базар",
    });
    expect(events.publish).toHaveBeenCalledWith({ type: "seller.registered", userId: "seller-1" });

    vi.clearAllMocks();
    const updatingRepo = fakeRepo({ getByUserId: vi.fn(async () => makeProfile()) });
    await new SellerProfileService(updatingRepo, events).upsertOwnProfile("seller-1", {
      storeName: "Кант Базар 2",
    });
    expect(events.publish).not.toHaveBeenCalled();
  });
});

describe("SellerProfileService.verifySeller / rejectSeller", () => {
  it("verifySeller sets VERIFIED and publishes seller.verified", async () => {
    const repo = fakeRepo({
      setVerificationStatus: vi.fn(async () => makeProfile({ verificationStatus: "VERIFIED" })),
    });
    const events = fakeEventBus();
    const service = new SellerProfileService(repo, events);

    await service.verifySeller("seller-1");

    expect(repo.setVerificationStatus).toHaveBeenCalledWith("seller-1", "VERIFIED");
    expect(events.publish).toHaveBeenCalledWith({ type: "seller.verified", userId: "seller-1" });
  });

  it("rejectSeller sets REJECTED and publishes seller.rejected", async () => {
    const repo = fakeRepo({
      setVerificationStatus: vi.fn(async () => makeProfile({ verificationStatus: "REJECTED" })),
    });
    const events = fakeEventBus();
    const service = new SellerProfileService(repo, events);

    await service.rejectSeller("seller-1");

    expect(repo.setVerificationStatus).toHaveBeenCalledWith("seller-1", "REJECTED");
    expect(events.publish).toHaveBeenCalledWith({ type: "seller.rejected", userId: "seller-1" });
  });
});
