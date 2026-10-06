export const registrationStatuses = [
  'PENDING',
  'CONFIRMED',
  'WAITING_LIST',
  'CANCELLED',
  'REFUNDED',
] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number];
