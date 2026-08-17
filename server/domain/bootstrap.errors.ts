/** Bootstrap has already produced its (only ever) first Root Owner — the claim window is closed permanently (docs/architecture/PLATFORM_INITIALIZATION_ARCHITECTURE.md §16). */
export class BootstrapAlreadyCompletedError extends Error {
  constructor() {
    super("Bootstrap already completed — a Root Owner already exists");
    this.name = "BootstrapAlreadyCompletedError";
  }
}
