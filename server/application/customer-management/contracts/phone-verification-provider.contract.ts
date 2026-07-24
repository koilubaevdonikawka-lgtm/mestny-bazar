/** Delivers phone verification codes without exposing transport details to use cases. */
export interface PhoneVerificationDeliveryInput {
  readonly customerId: string;
  readonly phone: string;
  readonly code: string;
}

export interface IPhoneVerificationProvider {
  sendVerificationCode(input: PhoneVerificationDeliveryInput): Promise<void>;
}
