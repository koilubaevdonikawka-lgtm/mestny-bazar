import type { StoredSecretEntry } from "@server/application/secrets-management/models/secret.model";

export interface ISecretSerializer {
  serialize(entry: StoredSecretEntry): string;
  deserialize(payload: string): StoredSecretEntry;
}
