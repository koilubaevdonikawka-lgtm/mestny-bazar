import type { ISecretProvider } from "@server/platform/runtime/runtime/contracts";

/** Reads secrets from process environment variables. */
export class EnvironmentSecretProvider implements ISecretProvider {
  getSecret(name: string): string | undefined {
    const key = name.trim();
    if (!key) {
      return undefined;
    }
    const value = process.env[key];
    return value?.trim() || undefined;
  }

  getRequiredSecret(name: string): string {
    const value = this.getSecret(name);
    if (!value) {
      throw new Error(`Required secret "${name}" is not configured.`);
    }
    return value;
  }

  hasSecret(name: string): boolean {
    return this.getSecret(name) !== undefined;
  }
}
