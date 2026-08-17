import type { CityDTO } from "@shared/contracts/delivery";
import type { ICityRepository } from "@server/ports/city.repository";

/** Buyer/admin-shared read wrapper — mirrors DeliveryZoneService's shape (thin Domain layer over a read-only port). */
export class CityService {
  constructor(private readonly cities: ICityRepository) {}

  async listActive(): Promise<CityDTO[]> {
    return this.cities.listActive();
  }
}
