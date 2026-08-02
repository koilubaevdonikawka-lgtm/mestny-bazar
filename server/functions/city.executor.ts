import type { CityDTO } from "@shared/contracts/delivery";
import { getServices } from "@server/di/container";

export async function executeListCities(): Promise<CityDTO[]> {
  return getServices().cities.listActive();
}
