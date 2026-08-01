import type { IStockRepository, StockRow } from "@server/ports/stock.repository";
import type { IStockPolicy } from "@server/ports/stock-policy.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type {
  AdjustStockRequest,
  SetStockThresholdRequest,
  StockItemDTO,
} from "@shared/contracts/stock";

/** Warehouse stock management (warehouse.md) — manual corrections + threshold config, gated through StockPolicyService. */
export class StockAdminService {
  constructor(
    private readonly stock: IStockRepository,
    private readonly stockPolicy: IStockPolicy,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async listStock(): Promise<StockItemDTO[]> {
    const rows = await this.stock.list();
    return rows.map((row) => this.toDTO(row));
  }

  async adjustStock(request: AdjustStockRequest): Promise<StockItemDTO> {
    const row = await this.stock.adjustStock(request.productId, request.stock);
    return this.evaluateAndNotify(row);
  }

  async setThreshold(request: SetStockThresholdRequest): Promise<StockItemDTO> {
    const row = await this.stock.setLowStockThreshold(request.productId, request.threshold);
    return this.evaluateAndNotify(row);
  }

  private async evaluateAndNotify(row: StockRow): Promise<StockItemDTO> {
    const dto = this.toDTO(row);

    if (dto.status === "depleted") {
      await this.events.publish({ type: "stock.depleted", productId: row.productId });
    } else if (dto.status === "low") {
      await this.events.publish({
        type: "stock.low",
        productId: row.productId,
        stock: row.stock,
        threshold: dto.effectiveThreshold,
      });
    }

    return dto;
  }

  private toDTO(row: StockRow): StockItemDTO {
    const result = this.stockPolicy.evaluateStock({
      productId: row.productId,
      categoryId: row.categoryId,
      stock: row.stock,
      threshold: row.lowStockThreshold,
    });

    return {
      productId: row.productId,
      name: row.name,
      stock: row.stock,
      lowStockThreshold: row.lowStockThreshold,
      effectiveThreshold: result.effectiveThreshold,
      status: result.allowed ? "ok" : result.denialCode === "DEPLETED" ? "depleted" : "low",
    };
  }
}
