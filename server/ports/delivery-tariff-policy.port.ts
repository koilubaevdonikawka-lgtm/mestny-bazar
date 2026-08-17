import type { DeliveryTariffDTO } from "@shared/contracts/delivery";

/** docs/delivery/delivery-rule-engine.md — "Delivery Tariff Policy". */
export interface DeliveryTariffPolicyContext {
  zoneId: string;
  /** Every tariff currently active and applicable to this zone (zone-owned + platform-wide defaults). */
  candidates: DeliveryTariffDTO[];
  orderDate: string;
  customerSegment?: "RETAIL" | "CORPORATE";
}

export interface DeliveryTariffPolicyResult {
  allowed: boolean;
  denialCode?: string;
  tariff?: DeliveryTariffDTO;
}

export interface IDeliveryTariffPolicy {
  evaluate(context: DeliveryTariffPolicyContext): DeliveryTariffPolicyResult;
}
