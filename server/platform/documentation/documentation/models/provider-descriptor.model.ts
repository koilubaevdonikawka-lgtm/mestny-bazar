/** Descriptor for an external provider adapter. */
export interface DocumentationProviderDescriptor {
  readonly id: string;
  readonly name: string;
  readonly capability: string;
  readonly vendor: string;
  readonly adapter: string;
  readonly enabled: boolean;
}

export function createDocumentationProviderDescriptor(input: {
  id: string;
  name: string;
  capability: string;
  vendor: string;
  adapter: string;
  enabled?: boolean;
}): DocumentationProviderDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    capability: input.capability.trim(),
    vendor: input.vendor.trim(),
    adapter: input.adapter.trim(),
    enabled: input.enabled ?? true,
  });
}
