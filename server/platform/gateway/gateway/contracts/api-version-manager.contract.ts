import type { ApiVersionDescriptor } from "@server/platform/gateway/gateway/models";

/** Contract for API version management. */
export interface IApiVersionManager {
  currentVersion(): ApiVersionDescriptor;
  supportedVersions(): readonly ApiVersionDescriptor[];
  resolveVersion(versionLabel: string): ApiVersionDescriptor | undefined;
}
