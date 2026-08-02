import type { CityDTO } from "@shared/contracts/delivery";

/** Read-only — city management UI is out of Этап 2's scope (docs/delivery/IMPLEMENTATION_ORDER.md); only the list is needed to populate the zone form's city picker. */
export interface ICityRepository {
  listActive(): Promise<CityDTO[]>;
}
