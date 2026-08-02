export class DeliveryZoneNotFoundError extends Error {
  constructor(zoneId: string) {
    super(`Delivery zone not found: ${zoneId}`);
    this.name = "DeliveryZoneNotFoundError";
  }
}

export class DeliveryNotAllowedError extends Error {
  constructor(
    public readonly denialCode: string,
    message: string,
  ) {
    super(message);
    this.name = "DeliveryNotAllowedError";
  }
}

export class NoDeliveryTariffError extends Error {
  constructor(zoneId: string) {
    super(`No applicable delivery tariff for zone: ${zoneId}`);
    this.name = "NoDeliveryTariffError";
  }
}

export class DeliveryTariffNotFoundError extends Error {
  constructor(tariffId: string) {
    super(`Delivery tariff not found: ${tariffId}`);
    this.name = "DeliveryTariffNotFoundError";
  }
}

export class DeliveryValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "DeliveryValidationError";
  }
}
