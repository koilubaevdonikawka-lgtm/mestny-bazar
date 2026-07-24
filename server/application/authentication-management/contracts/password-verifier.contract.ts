export interface IPasswordVerifier {
  hash(plainText: string): Promise<string>;
  verify(plainText: string, hashed: string): Promise<boolean>;
}
