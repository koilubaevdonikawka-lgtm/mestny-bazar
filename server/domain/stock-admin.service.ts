import type { IStockRepository, StockRow } from "@server/ports/stock.repository";
import type { IStockPolicy } from "@server/ports/stock-policy.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { ISupplierRepository } from "@server/ports/supplier.repository";
import type { InventoryService } from "@server/domain/inventory.service";
import { StockValidationError } from "@server/domain/stock.errors";
import type {
  AdjustStockRequest,
  RecordStockReceiptRequest,
  RecordStockReturnRequest,
  SetStockThresholdRequest,
  StockItemDTO,
} from "@shared/contracts/stock";

/**
 * Warehouse stock management (warehouse.md) — manual corrections + threshold
 * config, gated through StockPolicyService. Движение товара (Промпт №4):
 * recordReceipt/recordReturn reuse the same InventoryService.increaseStock()
 * Suppliers already uses as "the single entry point" for stock increases —
 * no second stock-mutation mechanism. The movement journal itself is the
 * existing audit_log/marketplace event bus (see server/domain/audit-log/
 * marketplace-events.subscriber.ts), viewable at the already-existing
 * /admin/logs — no new journal entity/screen was created for this.
 */
export class StockAdminService {
  constructor(
    private readonly stock: IStockRepository,
    private readonly stockPolicy: IStockPolicy,
    private readonly events: IMarketplaceEventBus,
    private readonly inventory: InventoryService,
    private readonly suppliers: ISupplierRepository,
  ) {}

  async listStock(): Promise<StockItemDTO[]> {
    const rows = await this.stock.list();
    return rows.map((row) => this.toDTO(row));
  }

  async adjustStock(request: AdjustStockRequest): Promise<StockItemDTO> {
    const row = await this.stock.adjustStock(request.productId, request.stock);
    await this.events.publish({
      type: "stock.adjusted",
      productId: row.productId,
      stock: row.stock,
    });
    return this.evaluateAndNotify(row);
  }

  async setThreshold(request: SetStockThresholdRequest): Promise<StockItemDTO> {
    const row = await this.stock.setLowStockThreshold(request.productId, request.threshold);
    return this.evaluateAndNotify(row);
  }

  /** Поступление — стороннее увеличение остатка вне формального workflow поставки (suppliers.md). */
  async recordReceipt(actorId: string, request: RecordStockReceiptRequest): Promise<StockItemDTO> {
    this.validateQuantity(request.quantity);
    this.validateMovementDate(request.movementDate);
    if (request.purchasePrice != null && request.purchasePrice < 0) {
      throw new StockValidationError("Purchase price must be non-negative", "purchasePrice");
    }
    await this.assertProductExists(request.productId);
    if (request.supplierId) {
      const supplier = await this.suppliers.getById(request.supplierId);
      if (!supplier) throw new StockValidationError("Supplier not found", "supplierId");
    }

    await this.inventory.increaseStock([
      { productId: request.productId, quantity: request.quantity },
    ]);
    const row = await this.assertProductExists(request.productId);

    await this.events.publish({
      type: "stock.received",
      productId: request.productId,
      quantity: request.quantity,
      actorId,
      movementDate: request.movementDate,
      purchasePrice: request.purchasePrice ?? null,
      supplierId: request.supplierId ?? null,
    });

    return this.evaluateAndNotify(row);
  }

  /** Возврат — товар возвращается на склад (например, от заказа), увеличивает остаток. */
  async recordReturn(actorId: string, request: RecordStockReturnRequest): Promise<StockItemDTO> {
    this.validateQuantity(request.quantity);
    this.validateMovementDate(request.movementDate);
    await this.assertProductExists(request.productId);

    await this.inventory.increaseStock([
      { productId: request.productId, quantity: request.quantity },
    ]);
    const row = await this.assertProductExists(request.productId);

    await this.events.publish({
      type: "stock.returned",
      productId: request.productId,
      quantity: request.quantity,
      actorId,
      movementDate: request.movementDate,
      note: request.note ?? null,
    });

    return this.evaluateAndNotify(row);
  }

  private async assertProductExists(productId: string): Promise<StockRow> {
    const row = await this.stock.getById(productId);
    if (!row) throw new StockValidationError("Product not found", "productId");
    return row;
  }

  private validateQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new StockValidationError("Quantity must be a positive integer", "quantity");
    }
  }

  private validateMovementDate(movementDate: string): void {
    if (!movementDate?.trim() || Number.isNaN(Date.parse(movementDate))) {
      throw new StockValidationError("A valid date is required", "movementDate");
    }
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
      unit: row.unit,
    };
  }
}
