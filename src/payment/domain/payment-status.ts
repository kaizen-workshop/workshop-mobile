export const paymentStatuses = [
  'PENDING',
  'PAID',
  'DECLINED',
  'CANCELLED',
  'REFUNDED',
  'EXEMPT',
] as const;

export type PaymentStatus = (typeof paymentStatuses)[number];
