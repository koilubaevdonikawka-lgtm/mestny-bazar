/** Registered AI hardware profile — generic hardware profile metadata only, no domain knowledge. */
export interface HardwareProfile {
  readonly hardwareProfileId: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly version: string;
  readonly status: "active" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegisterHardwareProfileInput {
  readonly name: string;
  readonly category: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface UpdateHardwareProfileInput {
  readonly hardwareProfileId: string;
  readonly name?: string;
  readonly category?: string;
  readonly description?: string;
  readonly version?: string;
  readonly status?: "active" | "inactive";
}

export interface ListHardwareProfilesResult {
  readonly hardwareProfiles: readonly HardwareProfile[];
  readonly total: number;
}

export interface FindHardwareProfileByNameResult {
  readonly hardwareProfile: HardwareProfile | null;
}

export interface ListHardwareProfilesByCategoryResult {
  readonly hardwareProfiles: readonly HardwareProfile[];
  readonly total: number;
  readonly category: string;
}

export interface DeleteHardwareProfileResult {
  readonly hardwareProfileId: string;
  readonly deleted: boolean;
}

export interface HardwareProfileRegistryStatistics {
  readonly totalHardwareProfiles: number;
  readonly activeHardwareProfiles: number;
  readonly categoryCount: number;
  readonly categories: readonly string[];
}

export function createHardwareProfile(input: {
  hardwareProfileId: string;
  name: string;
  category: string;
  description?: string;
  version?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}): HardwareProfile {
  const now = new Date().toISOString();
  return Object.freeze({
    hardwareProfileId: input.hardwareProfileId,
    name: input.name.trim(),
    category: input.category.trim(),
    description: (input.description ?? "").trim(),
    version: (input.version ?? "1.0.0").trim(),
    status: input.status ?? "active",
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
