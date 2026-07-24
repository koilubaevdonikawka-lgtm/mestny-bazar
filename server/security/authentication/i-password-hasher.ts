/** Hashes and verifies passwords — implementation supplied by infrastructure. */
export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  verify(plainText: string, hashed: string): Promise<boolean>;
  needsRehash(hashed: string): Promise<boolean>;
}
