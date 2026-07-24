/** Multi-factor authentication operations — implementation supplied by infrastructure. */
export interface IMfaProvider {
  isEnabled(userId: string): Promise<boolean>;
  initiateChallenge(userId: string): Promise<{ challengeId: string; expiresAt: string }>;
  verifyChallenge(userId: string, challengeId: string, code: string): Promise<boolean>;
}
