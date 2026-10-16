import type { PaymentStatus } from './payment-status';

export type PaymentResult = Readonly<{
  id: string;
  registrationId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  /** Opaque reference from the simulated gateway, shown as the simulated PIX code. */
  reference?: string;
}>;
