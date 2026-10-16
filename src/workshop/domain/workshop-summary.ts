export type WorkshopSummary = Readonly<{
  id: string;
  title: string;
  imageUrl?: string;
  description?: string;
  theme?: string;
  scheduleLabel?: string;
  locationLabel?: string;
  modality?: string;
  priceLabel?: string;
  registrationLabel?: string;
  /** False when the registration period has not started or already ended. */
  registrationOpen?: boolean;
}>;
