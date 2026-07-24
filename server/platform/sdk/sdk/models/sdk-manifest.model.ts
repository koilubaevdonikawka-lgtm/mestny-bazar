/** Generated SDK manifest with client, contract and endpoint metadata. */
export interface SDKManifest {
  readonly id: string;
  readonly version: string;
  readonly generatedAt: string;
  readonly clientManifest: Readonly<Record<string, unknown>>;
  readonly sdkManifest: Readonly<Record<string, unknown>>;
  readonly contractManifest: Readonly<Record<string, unknown>>;
  readonly endpointManifest: Readonly<Record<string, unknown>>;
}

export function createSDKManifest(input: {
  id?: string;
  version: string;
  clientManifest: Readonly<Record<string, unknown>>;
  sdkManifest: Readonly<Record<string, unknown>>;
  contractManifest: Readonly<Record<string, unknown>>;
  endpointManifest: Readonly<Record<string, unknown>>;
}): SDKManifest {
  return Object.freeze({
    id: input.id ?? `sdk-manifest-${Date.now()}`,
    version: input.version.trim(),
    generatedAt: new Date().toISOString(),
    clientManifest: Object.freeze({ ...input.clientManifest }),
    sdkManifest: Object.freeze({ ...input.sdkManifest }),
    contractManifest: Object.freeze({ ...input.contractManifest }),
    endpointManifest: Object.freeze({ ...input.endpointManifest }),
  });
}
