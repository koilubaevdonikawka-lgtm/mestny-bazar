import type { IApiVersionManager } from "@server/platform/gateway/gateway/contracts";
import type { GatewayRequest } from "@server/platform/gateway/gateway/models";

/** Resolves API version from gateway requests. */
export class VersionRouter {
  constructor(private readonly versionManager: IApiVersionManager) {}

  resolve(request: GatewayRequest): string {
    const fromHeader = request.headers["x-api-version"];
    if (fromHeader) {
      const resolved = this.versionManager.resolveVersion(fromHeader);
      if (resolved) {
        return resolved.label;
      }
    }

    const pathMatch = /^\/(v\d+\.\d+)\//.exec(request.path);
    if (pathMatch) {
      const resolved = this.versionManager.resolveVersion(pathMatch[1]);
      if (resolved) {
        return resolved.label;
      }
    }

    return this.versionManager.currentVersion().label;
  }
}
