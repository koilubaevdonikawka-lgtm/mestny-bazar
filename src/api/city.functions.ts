import { createServerFn } from "@tanstack/react-start";
import type { CityDTO } from "@shared/contracts/delivery";

export const listCitiesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CityDTO[]> => {
    const { executeListCities } = await import("@server/functions/city.executor");
    return executeListCities();
  },
);
