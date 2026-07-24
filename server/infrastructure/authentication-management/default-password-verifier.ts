import type { IPasswordVerifier } from "@server/application/authentication-management/contracts/password-verifier.contract";

/** Simple local password verifier for in-memory authentication. */
export class DefaultPasswordVerifier implements IPasswordVerifier {
  async hash(plainText: string): Promise<string> {
    return `local:${Buffer.from(plainText).toString("base64url")}`;
  }

  async verify(plainText: string, hashed: string): Promise<boolean> {
    return (await this.hash(plainText)) === hashed;
  }
}
