import type {
  AdjustVariantStockRequest,
  InitializeVariantStockRequest,
  SetVariantStockThresholdRequest,
  VariantStockDTO,
} from "@shared/contracts/variant-stock";
import type {
  IVariantStockRepository,
  VariantStockReservationItem,
  VariantStockRow,
} from "@server/ports/variant-stock.repository";
import type { IProductVariantRepository } from "@server/ports/product-variant.repository";
import type { IStockPolicy } from "@server/ports/stock-policy.port";
import type { ProductVariantDTO } from "@shared/contracts/product-variant";
import {
  VariantStockAlreadyExistsError,
  VariantStockNotFoundError,
  VariantStockValidationError,
} from "@server/domain/variant-stock.errors";

/**
 * Independent stock accounting per variant (Stage 14). Mirrors
 * StockAdminService's read/adjust/threshold shape, reusing the exact same
 * IStockPolicy (StockPolicyService + LowStockThresholdRule) the product
 * warehouse already uses for low/depleted classification — no parallel
 * policy engine. Still excludes recordReceipt/recordReturn (the
 * movement/supply-receipt operations) — out of scope. reserveStock/
 * releaseStock (Stage 19) mirror InventoryService's exact thin-delegation
 * shape, wired into CheckoutService the same way inventory.reserveStock
 * already is.
 */
export class VariantStockService {
  constructor(
    private readonly variantStock: IVariantStockRepository,
    private readonly variants: IProductVariantRepository,
    private readonly stockPolicy: IStockPolicy,
  ) {}

  /** Mirrors InventoryService.reserveStock exactly — thin delegation, atomic RPC underneath. */
  async reserveStock(items: VariantStockReservationItem[]): Promise<void> {
    await this.variantStock.reserveStock(items);
  }

  /** Mirrors InventoryService.releaseStock exactly. */
  async releaseStock(items: VariantStockReservationItem[]): Promise<void> {
    await this.variantStock.releaseStock(items);
  }

  async listForProduct(productId: string): Promise<VariantStockDTO[]> {
    const rows = await this.variantStock.listForProduct(productId);
    return rows.map((row) => this.toDTO(row, productId));
  }

  async getByVariantId(variantId: string): Promise<VariantStockDTO | null> {
    const row = await this.variantStock.getByVariantId(variantId);
    if (!row) return null;
    const variant = await this.assertVariantExists(variantId);
    return this.toDTO(row, variant.productId);
  }

  async initializeStock(data: InitializeVariantStockRequest): Promise<VariantStockDTO> {
    const variant = await this.assertVariantExists(data.variantId);
    if (await this.variantStock.getByVariantId(data.variantId)) {
      throw new VariantStockAlreadyExistsError();
    }

    const stock = data.stock ?? 0;
    this.validateStock(stock);
    if (data.lowStockThreshold != null) this.validateThreshold(data.lowStockThreshold);

    const row = await this.variantStock.create(
      data.variantId,
      stock,
      data.lowStockThreshold ?? null,
    );
    return this.toDTO(row, variant.productId);
  }

  async adjustStock(data: AdjustVariantStockRequest): Promise<VariantStockDTO> {
    this.validateStock(data.stock);
    const variant = await this.assertVariantExists(data.variantId);
    await this.assertStockTracked(data.variantId);

    const row = await this.variantStock.adjustStock(data.variantId, data.stock);
    return this.toDTO(row, variant.productId);
  }

  async setThreshold(data: SetVariantStockThresholdRequest): Promise<VariantStockDTO> {
    if (data.threshold != null) this.validateThreshold(data.threshold);
    const variant = await this.assertVariantExists(data.variantId);
    await this.assertStockTracked(data.variantId);

    const row = await this.variantStock.setLowStockThreshold(data.variantId, data.threshold);
    return this.toDTO(row, variant.productId);
  }

  private async assertVariantExists(variantId: string): Promise<ProductVariantDTO> {
    const variant = await this.variants.getById(variantId);
    if (!variant) throw new VariantStockValidationError("Variant not found", "variantId");
    return variant;
  }

  private async assertStockTracked(variantId: string): Promise<void> {
    if (!(await this.variantStock.getByVariantId(variantId))) {
      throw new VariantStockNotFoundError();
    }
  }

  private validateStock(stock: number): void {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new VariantStockValidationError("Stock must be a non-negative integer", "stock");
    }
  }

  private validateThreshold(threshold: number): void {
    if (!Number.isInteger(threshold) || threshold < 0) {
      throw new VariantStockValidationError(
        "Threshold must be a non-negative integer",
        "lowStockThreshold",
      );
    }
  }

  private toDTO(row: VariantStockRow, productId: string): VariantStockDTO {
    const result = this.stockPolicy.evaluateStock({
      productId,
      categoryId: null,
      stock: row.stock,
      threshold: row.lowStockThreshold,
    });

    return {
      variantId: row.variantId,
      stock: row.stock,
      lowStockThreshold: row.lowStockThreshold,
      effectiveThreshold: result.effectiveThreshold,
      status: result.allowed ? "ok" : result.denialCode === "DEPLETED" ? "depleted" : "low",
    };
  }
}
