import type { CityDTO } from "@shared/contracts/delivery";
import { listCitiesFn } from "@/api/city.functions";

export async function listCities(): Promise<CityDTO[]> {
  return listCitiesFn();
}
