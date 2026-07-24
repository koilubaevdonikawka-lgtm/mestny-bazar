import type { StoredSecretEntry } from "@server/application/secrets-management/models/secret.model";

export interface ISecretRepository {
  save(entry: StoredSecretEntry): Promise<void>;
  findByKey(key: string): Promise<StoredSecretEntry | null>;
  delete(key: string): Promise<void>;
  findAll(): Promise<readonly StoredSecretEntry[]>;
  exists(key: string): Promise<boolean>;
}
