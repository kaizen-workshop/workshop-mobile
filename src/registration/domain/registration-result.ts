import type { PaymentStatus } from '@/payment/domain';
import type { RegistrationStatus } from './registration-status';

export type RegistrationResult = Readonly<{
  id: string;
  workshopId: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
}>;
