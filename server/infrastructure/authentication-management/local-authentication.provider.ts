import type { IPasswordVerifier } from "@server/application/authentication-management/contracts/password-verifier.contract";
import type {
  AuthenticationCredentials,
  AuthenticationIdentity,
  IAuthenticationProvider,
} from "@server/application/authentication-management/contracts/authentication-provider.contract";

interface LocalCredentialRecord {
  readonly userId: string;
  readonly username: string;
  readonly passwordHash: string;
}

/** Local in-memory authentication — credential lookup only, not user profile storage. */
export class LocalAuthenticationProvider implements IAuthenticationProvider {
  private readonly credentials = new Map<string, LocalCredentialRecord>();

  constructor(private readonly passwordVerifier: IPasswordVerifier) {
    this.seedDefaultCredentials();
  }

  async authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationIdentity> {
    const username = credentials.username.trim().toLowerCase();
    const record = this.credentials.get(username);

    if (!record) {
      throw new Error("Invalid username or password.");
    }

    const valid = await this.passwordVerifier.verify(credentials.password, record.passwordHash);
    if (!valid) {
      throw new Error("Invalid username or password.");
    }

    return Object.freeze({
      userId: record.userId,
      username: record.username,
    });
  }

  private seedDefaultCredentials(): void {
    this.registerCredential("admin", "admin-user", "admin123");
    this.registerCredential("seller", "seller-user", "seller123");
    this.registerCredential("customer", "customer-user", "customer123");
  }

  private registerCredential(username: string, userId: string, password: string): void {
    const passwordHash = this.hashSync(password);
    this.credentials.set(username.toLowerCase(), Object.freeze({
      userId,
      username,
      passwordHash,
    }));
  }

  private hashSync(password: string): string {
    return `local:${Buffer.from(password).toString("base64url")}`;
  }
}
