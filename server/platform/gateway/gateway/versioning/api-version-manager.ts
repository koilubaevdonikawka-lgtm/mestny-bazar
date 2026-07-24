import type { IApiVersionManager } from "@server/platform/gateway/gateway/contracts";
import {
  createApiVersionDescriptor,
  type ApiVersionDescriptor,
} from "@server/platform/gateway/gateway/models";

const DEFAULT_VERSION = createApiVersionDescriptor({ major: 1, minor: 0 });

/** Manages supported API versions for the gateway. */
export class ApiVersionManager implements IApiVersionManager {
  private current = DEFAULT_VERSION;
  private readonly versions = new Map<string, ApiVersionDescriptor>([
    [DEFAULT_VERSION.label, DEFAULT_VERSION],
  ]);

  currentVersion(): ApiVersionDescriptor {
    return this.current;
  }

  supportedVersions(): readonly ApiVersionDescriptor[] {
    return Object.freeze([...this.versions.values()]);
  }

  resolveVersion(versionLabel: string): ApiVersionDescriptor | undefined {
    const normalized = versionLabel.trim().startsWith("v")
      ? versionLabel.trim()
      : `v${versionLabel.trim()}`;
    return this.versions.get(normalized);
  }

  registerVersion(version: ApiVersionDescriptor): void {
    this.versions.set(version.label, Object.freeze({ ...version }));
  }

  setCurrentVersion(version: ApiVersionDescriptor): void {
    this.current = version;
    this.registerVersion(version);
  }
}
