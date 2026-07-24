export interface ConfigurationImportItem {
  readonly key: string;
  readonly value: unknown;
  readonly description?: string | null;
  readonly encrypted?: boolean;
}

export interface IConfigurationImportExportProvider {
  export(items: readonly ConfigurationImportItem[]): Promise<string>;
  parseImport(payload: string | Readonly<Record<string, unknown>>): Promise<readonly ConfigurationImportItem[]>;
}
