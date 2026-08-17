import type { ISupplyRepository } from "@server/ports/supply.repository";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { InventoryService } from "@server/domain/inventory.service";
import type { CreateSupplyRequest, SupplyDTO } from "@shared/contracts/supplier";
import { SupplyStatus } from "@shared/contracts/supplier";
import {
  SupplierNotFoundError,
  SupplyNotFoundError,
  SupplyTransitionError,
} from "@server/domain/supplier.errors";

/**
 * Supply request lifecycle (suppliers.md — DRAFT → SENT → CONFIRMED → RECEIVED/CANCELLED).
 * A simple explicit transition table, not a full Rule Engine, per the module's own
 * guidance for a first pass with few, non-role-differentiated transitions — the public
 * method shape stays stable if it needs to grow into one later.
 *
 * Receiving is the ONLY point where Suppliers writes to Warehouse's stock, and it goes
 * through InventoryService — the same port Checkout already uses for reservation — never
 * a direct query, so Warehouse keeps a single source of truth for its own stock.
 */
export class SupplyService {
  constructor(
    private readonly supplies: ISupplyRepository,
    private readonly suppliers: ISupplierRepository,
    private readonly inventory: InventoryService,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listSupplies(): Promise<SupplyDTO[]> {
    return this.supplies.list();
  }

  async getSupply(id: string): Promise<SupplyDTO> {
    const supply = await this.supplies.getById(id);
    if (!supply) throw new SupplyNotFoundError();
    return supply;
  }

  async createSupply(data: CreateSupplyRequest): Promise<SupplyDTO> {
    const supplier = await this.suppliers.getById(data.supplierId);
    if (!supplier) throw new SupplierNotFoundError();

    const supply = await this.supplies.create(data);
    await this.events.publish({ type: "supply.requested", supply });
    return supply;
  }

  async sendSupply(id: string): Promise<SupplyDTO> {
    return this.transition(id, SupplyStatus.DRAFT, SupplyStatus.SENT);
  }

  async confirmSupply(id: string): Promise<SupplyDTO> {
    return this.transition(id, SupplyStatus.SENT, SupplyStatus.CONFIRMED);
  }

  async cancelSupply(id: string): Promise<SupplyDTO> {
    const supply = await this.getSupply(id);
    this.assertNotFinal(supply);
    return this.supplies.updateStatus(id, SupplyStatus.CANCELLED);
  }

  async receiveSupply(id: string): Promise<SupplyDTO> {
    const supply = await this.getSupply(id);
    this.assertNotFinal(supply);

    const updated = await this.supplies.updateStatus(id, SupplyStatus.RECEIVED);
    await this.inventory.increaseStock(
      supply.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    );
    await this.events.publish({ type: "supply.received", supply: updated });
    return updated;
  }

  private async transition(
    id: string,
    fromStatus: (typeof SupplyStatus)[keyof typeof SupplyStatus],
    toStatus: (typeof SupplyStatus)[keyof typeof SupplyStatus],
  ): Promise<SupplyDTO> {
    const supply = await this.getSupply(id);
    if (supply.status !== fromStatus) {
      throw new SupplyTransitionError(`Supply is "${supply.status}", expected "${fromStatus}"`);
    }
    return this.supplies.updateStatus(id, toStatus);
  }

  private assertNotFinal(supply: SupplyDTO): void {
    if (supply.status === SupplyStatus.RECEIVED || supply.status === SupplyStatus.CANCELLED) {
      throw new SupplyTransitionError(`Supply is already "${supply.status}"`);
    }
  }
}
