/** Not stored — computed from Root Owner presence (docs/architecture/BOOTSTRAP_DATA_MODEL_ARCHITECTURE.md §7). */
export type BootstrapEligibility = "ELIGIBLE" | "COMPLETED";

export interface BootstrapStatusDTO {
  eligibility: BootstrapEligibility;
}
