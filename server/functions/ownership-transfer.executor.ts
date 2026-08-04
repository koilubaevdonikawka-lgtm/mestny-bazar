import type {
  InitiateOwnershipTransferRequest,
  OwnershipTransferDTO,
} from "@shared/contracts/ownership-transfer";
import { requireUserIdFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

// No role check beyond "authenticated" — Ownership does not go through
// PermissionPolicyService (docs/architecture/PLATFORM_OWNERSHIP_ARCHITECTURE.md §3).
// "Who may initiate/accept/cancel" is enforced inside OwnershipTransferService itself.
export async function executeInitiateOwnershipTransfer(
  data: InitiateOwnershipTransferRequest,
): Promise<OwnershipTransferDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().ownershipTransferService.initiate(
    userId,
    data.targetUserId,
    data.fullHandover,
  );
}

export async function executeAcceptOwnershipTransfer(id: string): Promise<OwnershipTransferDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().ownershipTransferService.accept(id, userId);
}

export async function executeCancelOwnershipTransfer(id: string): Promise<OwnershipTransferDTO> {
  const userId = await requireUserIdFromRequest();
  return getServices().ownershipTransferService.cancel(id, userId);
}
