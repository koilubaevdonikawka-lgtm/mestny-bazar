export type OwnershipTransferStatus = "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";

export interface OwnershipTransferDTO {
  id: string;
  initiatorUserId: string;
  targetUserId: string;
  status: OwnershipTransferStatus;
  fullHandover: boolean;
  createdAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

export interface InitiateOwnershipTransferRequest {
  targetUserId: string;
  fullHandover: boolean;
}
