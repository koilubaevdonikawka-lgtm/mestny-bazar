import { describe, expect, it, vi } from "vitest";
import { BootstrapService } from "@server/domain/bootstrap.service";
import { BootstrapAlreadyCompletedError } from "@server/domain/bootstrap.errors";
import type { PlatformOwnershipService } from "@server/domain/platform-ownership.service";
import type { IBootstrapRepository } from "@server/ports/bootstrap.repository";

function fakePlatformOwnership(rootOwnerCount = 0): PlatformOwnershipService {
  return {
    countByRole: vi.fn(async (role: string) => (role === "ROOT_OWNER" ? rootOwnerCount : 0)),
  } as unknown as PlatformOwnershipService;
}

function fakeBootstrapRepo(overrides: Partial<IBootstrapRepository> = {}): IBootstrapRepository {
  return {
    claimRootOwner: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("BootstrapService.getEligibility", () => {
  it("returns ELIGIBLE when no Root Owner exists", async () => {
    const service = new BootstrapService(fakePlatformOwnership(0), fakeBootstrapRepo());

    await expect(service.getEligibility()).resolves.toBe("ELIGIBLE");
  });

  it("returns COMPLETED once a Root Owner exists", async () => {
    const service = new BootstrapService(fakePlatformOwnership(1), fakeBootstrapRepo());

    await expect(service.getEligibility()).resolves.toBe("COMPLETED");
  });

  it("checks the ROOT_OWNER role specifically, not any ownership role", async () => {
    const platformOwnership = fakePlatformOwnership(0);
    const service = new BootstrapService(platformOwnership, fakeBootstrapRepo());

    await service.getEligibility();

    expect(platformOwnership.countByRole).toHaveBeenCalledWith("ROOT_OWNER");
  });
});

describe("BootstrapService.claim", () => {
  it("delegates to the repository's atomic claim operation", async () => {
    const bootstrapRepo = fakeBootstrapRepo();
    const service = new BootstrapService(fakePlatformOwnership(0), bootstrapRepo);

    await service.claim("user-1");

    expect(bootstrapRepo.claimRootOwner).toHaveBeenCalledWith("user-1");
  });

  it("propagates BootstrapAlreadyCompletedError from the repository without swallowing it", async () => {
    const bootstrapRepo = fakeBootstrapRepo({
      claimRootOwner: vi.fn(async () => {
        throw new BootstrapAlreadyCompletedError();
      }),
    });
    const service = new BootstrapService(fakePlatformOwnership(1), bootstrapRepo);

    await expect(service.claim("user-2")).rejects.toBeInstanceOf(BootstrapAlreadyCompletedError);
  });

  it("does not perform a separate check-then-act — claim is called unconditionally, the atomic guarantee lives in the repository", async () => {
    const bootstrapRepo = fakeBootstrapRepo();
    const platformOwnership = fakePlatformOwnership(0);
    const service = new BootstrapService(platformOwnership, bootstrapRepo);

    await service.claim("user-1");

    // BootstrapService.claim must not call countByRole itself — that would create a
    // check-then-act race independent of (and undermining) the atomic DB function.
    expect(platformOwnership.countByRole).not.toHaveBeenCalled();
  });
});
