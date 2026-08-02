import type { DeliveryFeeQuote } from "@shared/contracts/delivery";
import type { IDeliveryZoneRepository } from "@server/ports/delivery-zone.repository";
import type { IDeliveryTariffRepository } from "@server/ports/delivery-tariff.repository";
import type { IDeliveryTariffPolicy } from "@server/ports/delivery-tariff-policy.port";
import type { IDeliveryZonePolicy } from "@server/ports/delivery-zone-policy.port";
import type {
  DeliveryPricingContext,
  IDeliveryPricingEngine,
} from "@server/ports/delivery-pricing-engine.port";
import { DeliveryCalculator } from "@server/domain/delivery-calculator";
import { DeliveryNotAllowedError, DeliveryZoneNotFoundError } from "@server/domain/delivery.errors";

/**
 * Orchestrator only — no business logic of its own, same role as
 * CheckoutService composing PaymentPolicyService/OrderLifecyclePolicy.
 * docs/delivery/delivery-pricing.md — "Delivery Pricing Engine".
 *
 * Step order intentionally differs from the original Этап 1 draft (Zone
 * Policy before Tariff Policy): MinOrderAmountRule needs a resolved tariff's
 * minOrderAmount, which does not exist before a tariff is selected — Tariff
 * Policy runs first, Zone Policy is asserted against its result. A bug found
 * while implementing the Этап 1 design, fixed here and reflected back into
 * delivery-pricing.md (same pattern as Этап 5's payout.created fix).
 */
export class DeliveryPricingEngine implements IDeliveryPricingEngine {
  constructor(
    private readonly zones: IDeliveryZoneRepository,
    private readonly tariffs: IDeliveryTariffRepository,
    private readonly tariffPolicy: IDeliveryTariffPolicy,
    private readonly zonePolicy: IDeliveryZonePolicy,
    private readonly calculator: DeliveryCalculator,
  ) {}

  async calculate(context: DeliveryPricingContext): Promise<DeliveryFeeQuote> {
    const zone = await this.zones.getById(context.zoneId);
    if (!zone) throw new DeliveryZoneNotFoundError(context.zoneId);

    const candidates = await this.tariffs.listActiveForZone(context.zoneId);
    const orderDate = context.orderDate ?? new Date().toISOString();

    const tariffResult = this.tariffPolicy.evaluate({
      zoneId: context.zoneId,
      candidates,
      orderDate,
      customerSegment: context.customerSegment,
    });
    if (!tariffResult.allowed || !tariffResult.tariff) {
      throw new DeliveryNotAllowedError(
        tariffResult.denialCode ?? "NO_MATCHING_TARIFF",
        "No delivery tariff applies to this zone",
      );
    }
    const tariff = tariffResult.tariff;

    this.zonePolicy.assert({
      zoneId: context.zoneId,
      subtotal: context.subtotal,
      minOrderAmount: tariff.minOrderAmount,
      isZoneActive: zone.isActive,
    });

    return this.calculator.calculate({
      zoneId: zone.id,
      zoneName: zone.name,
      tariff,
      subtotal: context.subtotal,
    });
  }
}
