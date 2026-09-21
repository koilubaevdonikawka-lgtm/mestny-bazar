import type {
  CityDTO,
  DeliveryTariffDTO,
  DeliveryZoneDTO,
  StoreDTO,
} from "@shared/contracts/delivery";

/**
 * Задача №295 — decides whether the admin "Доставка" screen can show its
 * simple, one-card-per-topic view (today's real setup: one city, one active
 * delivery zone, one active tariff for it, at most one dispatch point) or
 * must show the full list-management interface. Pure display logic: it
 * never changes what is stored or how a fee is calculated, and the moment
 * a second city/zone/tariff/store appears it returns null, which brings the
 * complete interface back on its own.
 */
export interface DeliverySetupInput {
  cities: CityDTO[];
  stores: StoreDTO[];
  zones: DeliveryZoneDTO[];
  tariffs: DeliveryTariffDTO[];
}

export interface SimpleDeliverySetup {
  city: CityDTO;
  zone: DeliveryZoneDTO;
  tariff: DeliveryTariffDTO;
  store: StoreDTO | null;
  /** Zones that are switched off — kept out of the simple view, reachable in the advanced one. */
  hiddenInactiveZones: number;
  /** Every tariff other than the one shown (switched off, or belonging to a switched-off zone). */
  hiddenOtherTariffs: number;
}

export function deriveSimpleDeliverySetup(input: DeliverySetupInput): SimpleDeliverySetup | null {
  const { cities, stores, zones, tariffs } = input;
  if (cities.length !== 1) return null;
  if (stores.length > 1) return null;

  const activeZones = zones.filter((zone) => zone.isActive);
  if (activeZones.length !== 1) return null;
  const zone = activeZones[0];

  // A tariff applies to this zone when it is bound to it, or is the
  // platform-wide default (zoneId null). More than one such active tariff
  // means the owner really is choosing between tariffs — full interface.
  const applicable = tariffs.filter(
    (tariff) => tariff.isActive && (tariff.zoneId === zone.id || tariff.zoneId === null),
  );
  if (applicable.length !== 1) return null;
  const tariff = applicable[0];

  return {
    city: cities[0],
    zone,
    tariff,
    store: stores[0] ?? null,
    hiddenInactiveZones: zones.length - 1,
    hiddenOtherTariffs: tariffs.length - 1,
  };
}

/**
 * What the buyer is actually charged, in words. Mirrors the constants in
 * server/domain/delivery-calculator.ts (client code may not import
 * server/**); delivery-admin-view.test.ts runs the real calculator against
 * these so the two can't drift apart unnoticed.
 */
export const DELIVERY_WEIGHT_RULE = {
  baseFee: 60,
  includedKg: 40,
  defaultExtraPerKg: 1,
} as const;

export function extraFeePerKg(tariff: Pick<DeliveryTariffDTO, "weightExtraFeePerKg">): number {
  return tariff.weightExtraFeePerKg ?? DELIVERY_WEIGHT_RULE.defaultExtraPerKg;
}
