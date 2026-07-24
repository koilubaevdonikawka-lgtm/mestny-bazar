import type {
  ConfigurationImportItem,
  IConfigurationImportExportProvider,
} from "@server/application/configuration-management/contracts/configuration-import-export-provider.contract";

interface ExportPayload {
  readonly format: string;
  readonly exportedAt: string;
  readonly items: readonly ConfigurationImportItem[];
}

/** Default JSON import/export provider for configuration snapshots. */
export class DefaultConfigurationImportExportProvider implements IConfigurationImportExportProvider {
  async export(items: readonly ConfigurationImportItem[]): Promise<string> {
    const payload: ExportPayload = Object.freeze({
      format: "json",
      exportedAt: new Date().toISOString(),
      items: Object.freeze([...items]),
    });

    return JSON.stringify(payload, null, 2);
  }

  async parseImport(
    payload: string | Readonly<Record<string, unknown>>,
  ): Promise<readonly ConfigurationImportItem[]> {
    const parsed =
      typeof payload === "string"
        ? (JSON.parse(payload) as ExportPayload | Record<string, unknown>)
        : payload;

    if (isExportPayload(parsed)) {
      return Object.freeze(
        parsed.items.map((item) =>
          Object.freeze({
            key: item.key,
            value: item.value,
            description: item.description,
            encrypted: item.encrypted,
          }),
        ),
      );
    }

    return Object.freeze(
      Object.entries(parsed).map(([key, value]) =>
        Object.freeze({
          key,
          value,
        }),
      ),
    );
  }
}

function isExportPayload(value: unknown): value is ExportPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray((value as ExportPayload).items)
  );
}
