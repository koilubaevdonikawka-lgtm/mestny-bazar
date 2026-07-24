export interface AuthenticationCredentials {
  readonly username: string;
  readonly password: string;
}

export interface AuthenticationIdentity {
  readonly userId: string;
  readonly username: string;
}

export interface IAuthenticationProvider {
  authenticate(credentials: AuthenticationCredentials): Promise<AuthenticationIdentity>;
}
