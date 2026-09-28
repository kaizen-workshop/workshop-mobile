export type WorkshopSummary = Readonly<{
  id: string;
  title: string;
  description?: string;
  theme?: string;
  scheduleLabel?: string;
  locationLabel?: string;
  modality?: string;
  priceLabel?: string;
  registrationLabel?: string;
}>;
