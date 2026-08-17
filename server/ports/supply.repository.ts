import type { CreateSupplyRequest, SupplyDTO, SupplyStatus } from "@shared/contracts/supplier";

export interface ISupplyRepository {
  list(): Promise<SupplyDTO[]>;
  getById(id: string): Promise<SupplyDTO | null>;
  create(data: CreateSupplyRequest): Promise<SupplyDTO>;
  updateStatus(id: string, status: SupplyStatus): Promise<SupplyDTO>;
}
