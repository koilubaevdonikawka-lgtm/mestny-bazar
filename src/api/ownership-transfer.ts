import type {
  InitiateOwnershipTransferRequest,
  OwnershipTransferDTO,
} from "@shared/contracts/ownership-transfer";
import {
  acceptOwnershipTransferFn,
  cancelOwnershipTransferFn,
  initiateOwnershipTransferFn,
} from "@/api/ownership-transfer.functions";

export async function initiateOwnershipTransfer(
  request: InitiateOwnershipTransferRequest,
): Promise<OwnershipTransferDTO> {
  return initiateOwnershipTransferFn({ data: request });
}

export async function acceptOwnershipTransfer(id: string): Promise<OwnershipTransferDTO> {
  return acceptOwnershipTransferFn({ data: { id } });
}

export async function cancelOwnershipTransfer(id: string): Promise<OwnershipTransferDTO> {
  return cancelOwnershipTransferFn({ data: { id } });
}
