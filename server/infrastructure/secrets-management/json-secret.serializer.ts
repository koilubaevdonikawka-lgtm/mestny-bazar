import type { ISecretSerializer } from "@server/application/secrets-management/contracts/secret-serializer.contract";
import { createStoredSecretEntry } from "@server/application/secrets-management/models/secret.model";
import type { StoredSecretEntry } from "@server/application/secrets-management/models/secret.model";

/** JSON secret serializer — serializes stored secret entries. */
export class JsonSecretSerializer implements ISecretSerializer {
  serialize(entry: StoredSecretEntry): string {
    return JSON.stringify(entry);
  }

  deserialize(payload: string): StoredSecretEntry {
    const parsed = JSON.parse(payload) as Partial<StoredSecretEntry>;
    return createStoredSecretEntry({
      secretId: String(parsed.secretId ?? ""),
      key: String(parsed.key ?? ""),
      encryptedValue: String(parsed.encryptedValue ?? ""),
      description: parsed.description,
      tags: parsed.tags,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
